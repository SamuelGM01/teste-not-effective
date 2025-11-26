
import { Trainer, Gym, Tournament, TournamentFormat, Invite } from '../types';

// --- BASE URL HANDLER ---
// Dynamically determine the API base URL to fix "Failed to fetch" errors.
const getBaseUrl = () => {
    if (typeof window !== 'undefined') {
        const { hostname, port } = window.location;
        // If running locally on a standard dev port (not 3000), point to 3000.
        // Otherwise (production/render/same-port), use relative path.
        if (hostname === 'localhost' && port !== '3000') {
            return 'http://localhost:3000';
        }
    }
    return '';
};

const API_BASE = getBaseUrl();

// --- HELPERS ---
const handleResponse = async (res: Response) => {
    if (!res.ok) {
        // Tenta ler o erro como JSON. Se falhar (ex: html 404), cria um erro genérico com o status.
        let errorMsg = `Error ${res.status}: ${res.statusText}`;
        try {
            const errorData = await res.json();
            if (errorData && errorData.error) {
                errorMsg = errorData.error;
            }
        } catch (e) {
            // Ignore JSON parse error, use fallback message
        }
        throw new Error(errorMsg);
    }
    return res.json();
};

const API_HEADERS = { 'Content-Type': 'application/json' };

// --- TRAINERS ---
export const getTrainers = async (): Promise<Trainer[]> => {
    const res = await fetch(`${API_BASE}/api/trainers`);
    const data = await handleResponse(res);
    return data.map((t: any) => ({ ...t, _id: t._id || t.id }));
};

export const createTrainer = async (nick: string, password?: string, customSkin?: string): Promise<Trainer> => {
    const res = await fetch(`${API_BASE}/api/trainers`, {
        method: 'POST',
        headers: API_HEADERS,
        body: JSON.stringify({ nick, password, customSkin })
    });
    return handleResponse(res);
};

export const login = async (nick: string, password?: string): Promise<Trainer> => {
    const res = await fetch(`${API_BASE}/api/login`, {
        method: 'POST',
        headers: API_HEADERS,
        body: JSON.stringify({ nick, password })
    });
    return handleResponse(res);
};

export const deleteTrainer = async (id: string): Promise<void> => {
    const res = await fetch(`${API_BASE}/api/trainers/${id}`, { method: 'DELETE' });
    await handleResponse(res);
};

export const toggleInsignia = async (trainerId: string, badgeId: string): Promise<Trainer> => {
    const res = await fetch(`${API_BASE}/api/insignias`, {
        method: 'POST',
        headers: API_HEADERS,
        body: JSON.stringify({ trainerId, badgeId })
    });
    return handleResponse(res);
};

// --- GYMS ---
export const getGyms = async (): Promise<Record<string, Gym>> => {
    try {
        const res = await fetch(`${API_BASE}/api/gyms`);
        return handleResponse(res);
    } catch (error) {
        // console.error("Failed to fetch gyms from DB:", error);
        throw error;
    }
};

export const updateGym = async (tipo: string, lider: string, time: (any | null)[], liderSkin?: string): Promise<void> => {
    const res = await fetch(`${API_BASE}/api/gyms`, {
        method: 'POST',
        headers: API_HEADERS,
        body: JSON.stringify({ tipo, lider, time, liderSkin })
    });
    await handleResponse(res);
};

export const resetGym = async (tipo: string): Promise<void> => {
    const res = await fetch(`${API_BASE}/api/gyms/reset`, {
        method: 'POST',
        headers: API_HEADERS,
        body: JSON.stringify({ tipo })
    });
    await handleResponse(res);
};

export const toggleGymChallenge = async (tipo: string, nick: string): Promise<void> => {
    const res = await fetch(`${API_BASE}/api/gyms/${tipo}/challenge`, {
        method: 'POST',
        headers: API_HEADERS,
        body: JSON.stringify({ nick })
    });
    await handleResponse(res);
};

export const acceptChallenge = async (tipo: string, challengerNick: string, date: string, time: string): Promise<void> => {
    const res = await fetch(`${API_BASE}/api/gyms/${tipo}/accept-challenge`, {
        method: 'POST',
        headers: API_HEADERS,
        body: JSON.stringify({ challengerNick, date, time })
    });
    await handleResponse(res);
};

export const resolveBattle = async (tipo: string, result: 'leader_win' | 'challenger_win'): Promise<void> => {
    const res = await fetch(`${API_BASE}/api/gyms/${tipo}/resolve-battle`, {
        method: 'POST',
        headers: API_HEADERS,
        body: JSON.stringify({ result })
    });
    await handleResponse(res);
};

// --- TOURNAMENTS ---
export const getTournaments = async (): Promise<Tournament[]> => {
    const res = await fetch(`${API_BASE}/api/tournaments`);
    const data = await handleResponse(res);
    return data.map((t: any) => ({ ...t, id: t._id || t.id }));
};

export const createTournament = async (name: string, format: TournamentFormat): Promise<Tournament> => {
    const res = await fetch(`${API_BASE}/api/tournaments`, {
        method: 'POST',
        headers: API_HEADERS,
        body: JSON.stringify({ name, format })
    });
    const t = await handleResponse(res);
    return { ...t, id: t._id || t.id };
};

export const joinTournamentMonotype = async (tournamentId: string, trainer: Trainer): Promise<void> => {
    // 1. Validation Logic
    const gyms = await getGyms();
    const userGym = Object.values(gyms).find(g => g && g.lider && g.lider.toLowerCase() === trainer.nick.toLowerCase());
    
    if (!userGym) throw new Error("Você precisa ser líder de um ginásio para participar do Monotype!");
    const fullTeam = userGym.time.filter((p): p is any => p !== null);
    if (fullTeam.length < 6) throw new Error("Seu time de ginásio precisa de 6 pokémons.");

    // 2. API Call
    const res = await fetch(`${API_BASE}/api/tournaments/${tournamentId}/join`, {
        method: 'POST',
        headers: API_HEADERS,
        body: JSON.stringify({
            trainerId: trainer._id,
            nick: trainer.nick,
            customSkin: trainer.customSkin,
            pokemon: fullTeam,
            gymType: userGym.tipo
        })
    });
    await handleResponse(res);
};

export const joinTournamentDoubles = async (tournamentId: string, trainer: Trainer, team: any[]): Promise<void> => {
    const res = await fetch(`${API_BASE}/api/tournaments/${tournamentId}/join`, {
        method: 'POST',
        headers: API_HEADERS,
        body: JSON.stringify({
            trainerId: trainer._id,
            nick: trainer.nick,
            customSkin: trainer.customSkin,
            pokemon: team
        })
    });
    await handleResponse(res);
};

export const leaveTournament = async (tournamentId: string, trainerId: string): Promise<void> => {
    const res = await fetch(`${API_BASE}/api/tournaments/${tournamentId}/leave`, {
        method: 'POST',
        headers: API_HEADERS,
        body: JSON.stringify({ trainerId })
    });
    await handleResponse(res);
};

export const startTournament = async (tournamentId: string): Promise<void> => {
    const res = await fetch(`${API_BASE}/api/tournaments/${tournamentId}/start`, {
        method: 'POST',
        headers: API_HEADERS,
        body: JSON.stringify({})
    });
    await handleResponse(res);
};

export const declareMatchWinner = async (tournamentId: string, matchId: string, winners: string[]): Promise<void> => {
    const res = await fetch(`${API_BASE}/api/tournaments/${tournamentId}/matches/${matchId}/win`, {
        method: 'POST',
        headers: API_HEADERS,
        body: JSON.stringify({ winners })
    });
    await handleResponse(res);
};

export const toggleBan = async (tournamentId: string, matchId: string, targetTrainerId: string, pokemonName: string): Promise<void> => {
    const res = await fetch(`${API_BASE}/api/tournaments/${tournamentId}/matches/${matchId}/ban`, {
        method: 'POST',
        headers: API_HEADERS,
        body: JSON.stringify({ targetTrainerId, pokemonName })
    });
    await handleResponse(res);
};

// --- INVITES ---
export const getInvites = async (userNick: string): Promise<Invite[]> => {
    const res = await fetch(`${API_BASE}/api/invites?nick=${encodeURIComponent(userNick)}`);
    const data = await handleResponse(res);
    return data.map((i: any) => ({ ...i, id: i._id || i.id }));
};

export const sendInvite = async (tournamentId: string, fromNick: string, toNick: string) => {
    const tournaments = await getTournaments();
    const t = tournaments.find(x => x.id === tournamentId);
    
    const res = await fetch(`${API_BASE}/api/invites`, {
        method: 'POST',
        headers: API_HEADERS,
        body: JSON.stringify({
            tournamentId,
            tournamentName: t?.name || "Torneio",
            fromNick,
            toNick
        })
    });
    await handleResponse(res);
};

export const respondToInvite = async (inviteId: string, accept: boolean) => {
    const res = await fetch(`${API_BASE}/api/invites/${inviteId}/respond`, {
        method: 'POST',
        headers: API_HEADERS,
        body: JSON.stringify({ accept })
    });
    await handleResponse(res);
};

// --- EXTERNAL API (POKEAPI) ---
export const searchPokemon = async (query: string) => {
    if (query.length < 2) return [];
    try {
        const response = await fetch('https://pokeapi.co/api/v2/pokemon?limit=10000');
        const data = await response.json();
        const results = data.results.filter((p: any) => p.name.includes(query.toLowerCase())).slice(0, 20);
        return results;
    } catch (e) {
        console.error(e);
        return [];
    }
};

export const getPokemonDetails = async (url: string) => {
    const res = await fetch(url);
    const data = await res.json();
    let sprite = data.sprites.front_default;
    
    if(data.sprites.versions && data.sprites.versions['generation-v'] && data.sprites.versions['generation-v']['black-white'].animated.front_default) {
         sprite = data.sprites.versions['generation-v']['black-white'].animated.front_default;
    }
    
    return {
        name: data.name,
        sprite: sprite
    };
};
