import { Trainer, Gym, Tournament, TournamentFormat, Pokemon, Invite } from '../types';

const API_URL = '/api';

const fetchAPI = async (url: string, options: RequestInit = {}) => {
    const headers = {
        'Content-Type': 'application/json',
        ...options.headers,
    };
    const response = await fetch(url, { ...options, headers });
    if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Request failed with status ' + response.status }));
        throw new Error(errorData.error || 'An unknown error occurred');
    }
    const contentType = response.headers.get("content-type");
    if (contentType && contentType.indexOf("application/json") !== -1) {
        return response.json();
    }
    return; // For success responses with no body
};


// --- TRAINERS ---
export const getTrainers = (): Promise<Trainer[]> => fetchAPI(`${API_URL}/trainers`);

export const createTrainer = (nick: string, password?: string, customSkin?: string): Promise<Trainer> => 
    fetchAPI(`${API_URL}/trainers`, {
        method: 'POST',
        body: JSON.stringify({ nick, password, customSkin }),
    });

export const login = (nick: string, password?: string): Promise<Trainer> =>
    fetchAPI(`${API_URL}/login`, {
        method: 'POST',
        body: JSON.stringify({ nick, password }),
    });

export const deleteTrainer = (id: string): Promise<void> =>
    fetchAPI(`${API_URL}/trainers/${id}`, { method: 'DELETE' });

export const toggleInsignia = (trainerId: string, badgeId: string): Promise<Trainer> =>
    fetchAPI(`${API_URL}/insignias`, {
        method: 'POST',
        body: JSON.stringify({ trainerId, badgeId }),
    });

// --- GYMS ---
export const getGyms = (): Promise<Record<string, Gym>> => fetchAPI(`${API_URL}/gyms`);

export const updateGym = (tipo: string, lider: string, time: (any | null)[], liderSkin?: string): Promise<void> =>
    fetchAPI(`${API_URL}/gyms`, {
        method: 'POST',
        body: JSON.stringify({ tipo, lider, time, liderSkin }),
    });

export const resetGym = (tipo: string): Promise<void> =>
    fetchAPI(`${API_URL}/gyms/reset`, {
        method: 'POST',
        body: JSON.stringify({ tipo }),
    });

export const toggleGymChallenge = (tipo: string, nick: string): Promise<void> => 
    fetchAPI(`${API_URL}/gyms/${tipo}/challenge`, {
        method: 'POST',
        body: JSON.stringify({ nick }),
    });

export const acceptChallenge = (tipo: string, challengerNick: string, date: string, time: string): Promise<void> =>
    fetchAPI(`${API_URL}/gyms/${tipo}/accept-challenge`, {
        method: 'POST',
        body: JSON.stringify({ challengerNick, date, time }),
    });

export const resolveBattle = (tipo: string, result: 'leader_win' | 'challenger_win'): Promise<void> =>
    fetchAPI(`${API_URL}/gyms/${tipo}/resolve-battle`, {
        method: 'POST',
        body: JSON.stringify({ result }),
    });

// --- TOURNAMENTS ---
export const getTournaments = (): Promise<Tournament[]> => fetchAPI(`${API_URL}/tournaments`);

export const createTournament = (name: string, format: TournamentFormat): Promise<Tournament> =>
    fetchAPI(`${API_URL}/tournaments`, {
        method: 'POST',
        body: JSON.stringify({ name, format }),
    });

export const joinTournamentMonotype = async (tournamentId: string, trainer: Trainer): Promise<void> => {
    const gyms = await getGyms();
    const userGym = Object.values(gyms).find(g => g && g.lider && g.lider.toLowerCase() === trainer.nick.toLowerCase());

    if (!userGym) throw new Error("Você precisa ser líder de um ginásio para participar do Monotype!");
    
    const fullTeam = userGym.time.filter((p): p is Pokemon => p !== null);
    if (fullTeam.length < 6) throw new Error("Seu time de ginásio precisa de 6 pokémons.");

    return fetchAPI(`${API_URL}/tournaments/${tournamentId}/join`, {
        method: 'POST',
        body: JSON.stringify({
            trainerId: trainer._id,
            nick: trainer.nick,
            customSkin: trainer.customSkin,
            pokemon: fullTeam as Pokemon[],
            gymType: userGym.tipo
        })
    });
};

export const joinTournamentDoubles = (tournamentId: string, trainer: Trainer, team: Pokemon[]): Promise<void> => {
    return fetchAPI(`${API_URL}/tournaments/${tournamentId}/join`, {
        method: 'POST',
        body: JSON.stringify({
            trainerId: trainer._id,
            nick: trainer.nick,
            customSkin: trainer.customSkin,
            pokemon: team
        })
    });
};

export const leaveTournament = (tournamentId: string, trainerId: string): Promise<void> =>
    fetchAPI(`${API_URL}/tournaments/${tournamentId}/leave`, {
        method: 'POST',
        body: JSON.stringify({ trainerId }),
    });

// --- TOURNAMENT LOGIC (BRACKETS) ---
export const startTournament = (tournamentId: string): Promise<void> =>
    fetchAPI(`${API_URL}/tournaments/${tournamentId}/start`, { method: 'POST' });

export const declareMatchWinner = (tournamentId: string, matchId: string, winners: string[]): Promise<void> =>
    fetchAPI(`${API_URL}/tournaments/${tournamentId}/matches/${matchId}/win`, {
        method: 'POST',
        body: JSON.stringify({ winners }),
    });

export const toggleBan = (tournamentId: string, matchId: string, targetTrainerId: string, pokemonName: string): Promise<void> =>
    fetchAPI(`${API_URL}/tournaments/${tournamentId}/matches/${matchId}/ban`, {
        method: 'POST',
        body: JSON.stringify({ targetTrainerId, pokemonName }),
    });

// --- INVITES ---
export const getInvites = (userNick: string): Promise<Invite[]> =>
    fetchAPI(`${API_URL}/invites?nick=${encodeURIComponent(userNick)}`);

export const sendInvite = (tournamentId: string, tournamentName: string, fromNick: string, toNick: string) =>
    fetchAPI(`${API_URL}/invites`, {
        method: 'POST',
        body: JSON.stringify({ tournamentId, tournamentName, fromNick, toNick }),
    });

export const respondToInvite = (inviteId: string, accept: boolean) =>
    fetchAPI(`${API_URL}/invites/${inviteId}/respond`, {
        method: 'POST',
        body: JSON.stringify({ accept }),
    });

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
