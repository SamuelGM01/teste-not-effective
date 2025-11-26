
import { Trainer, Gym, Tournament, TournamentFormat, Pokemon, Invite, GymBattle } from '../types';

// --- CONFIGURATION ---
const API_URL = 'http://localhost:3000/api';

// --- HELPER FUNCTIONS ---
const handleResponse = async (response: Response) => {
    if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `Error ${response.status}: ${response.statusText}`);
    }
    return response.json();
};

// --- TRAINERS ---
export const getTrainers = async (): Promise<Trainer[]> => {
    const response = await fetch(`${API_URL}/trainers`);
    return handleResponse(response);
};

export const createTrainer = async (nick: string, password?: string, customSkin?: string): Promise<Trainer> => {
    const response = await fetch(`${API_URL}/trainers`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nick, password, customSkin })
    });
    return handleResponse(response);
};

export const login = async (nick: string, password?: string): Promise<Trainer> => {
    const response = await fetch(`${API_URL}/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nick, password })
    });
    return handleResponse(response);
};

export const deleteTrainer = async (id: string): Promise<void> => {
    const response = await fetch(`${API_URL}/trainers/${id}`, {
        method: 'DELETE'
    });
    return handleResponse(response);
};

export const toggleInsignia = async (trainerId: string, badgeId: string): Promise<Trainer> => {
    const response = await fetch(`${API_URL}/insignias`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ trainerId, badgeId })
    });
    return handleResponse(response);
};

// --- GYMS ---
export const getGyms = async (): Promise<Record<string, Gym>> => {
    const response = await fetch(`${API_URL}/gyms`);
    return handleResponse(response);
};

export const updateGym = async (tipo: string, lider: string, time: (any | null)[], liderSkin?: string): Promise<void> => {
    const response = await fetch(`${API_URL}/gyms`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tipo, lider, time, liderSkin })
    });
    return handleResponse(response);
};

export const resetGym = async (tipo: string): Promise<void> => {
    const response = await fetch(`${API_URL}/gyms/reset`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tipo })
    });
    return handleResponse(response);
};

export const toggleGymChallenge = async (tipo: string, nick: string): Promise<void> => {
    const response = await fetch(`${API_URL}/gyms/${tipo}/challenge`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nick })
    });
    return handleResponse(response);
};

// Note: Requires backend implementation for these specific battle actions if not covered by generic update
// Currently generic updateGym handles time/leader, but battles need specific endpoints or embedded update logic.
// We will simulate these calls by assuming the backend logic exists or leveraging the generic structure where possible
// For a full implementation, specific endpoints like /gyms/:tipo/battle would be better, but based on server.js provided:

// NOTE: Since the server.js provided handles generic structure, we might need to expand it or use what we have.
// However, looking at the provided server.js, there is no specific route for `acceptChallenge` or `resolveBattle`.
// To make this work with the provided server.js, we need to add those routes or update the `Gym` object directly via updateGym (risky for race conditions)
// or assumes the server.js was updated to include battle logic. 
// *ASSUMING* I should implement the client side calls that match the logical intent. 
// I will implement these as if the endpoints exist (I will update server.js to include them).

export const acceptChallenge = async (tipo: string, challengerNick: string, date: string, time: string): Promise<void> => {
     const response = await fetch(`${API_URL}/gyms/${tipo}/battle/accept`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ challengerNick, date, time })
    });
    return handleResponse(response);
};

export const resolveBattle = async (tipo: string, result: 'leader_win' | 'challenger_win'): Promise<void> => {
    const response = await fetch(`${API_URL}/gyms/${tipo}/battle/resolve`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ result })
    });
    return handleResponse(response);
};

// --- TOURNAMENTS ---
export const getTournaments = async (): Promise<Tournament[]> => {
    const response = await fetch(`${API_URL}/tournaments`);
    return handleResponse(response);
};

export const createTournament = async (name: string, format: TournamentFormat): Promise<Tournament> => {
    const response = await fetch(`${API_URL}/tournaments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, format })
    });
    return handleResponse(response);
};

export const joinTournamentMonotype = async (tournamentId: string, trainer: Trainer): Promise<void> => {
    // We need to fetch current gyms to validate leader status on backend or trust frontend?
    // Backend validation is better. Sending gymType and pokemon.
    
    // Fetch gyms to get the user's team
    const gyms = await getGyms();
    const userGym = Object.values(gyms).find(g => g && g.lider && g.lider.toLowerCase() === trainer.nick.toLowerCase());

    if (!userGym) throw new Error("Você precisa ser líder de um ginásio para participar do Monotype!");
    const fullTeam = userGym.time.filter((p): p is Pokemon => p !== null);
    if (fullTeam.length < 6) throw new Error("Seu time de ginásio precisa de 6 pokémons.");

    const response = await fetch(`${API_URL}/tournaments/${tournamentId}/join`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            trainerId: trainer._id,
            nick: trainer.nick,
            customSkin: trainer.customSkin,
            pokemon: fullTeam,
            gymType: userGym.tipo
        })
    });
    return handleResponse(response);
};

export const joinTournamentDoubles = async (tournamentId: string, trainer: Trainer, team: Pokemon[]): Promise<void> => {
    const response = await fetch(`${API_URL}/tournaments/${tournamentId}/join`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            trainerId: trainer._id,
            nick: trainer.nick,
            customSkin: trainer.customSkin,
            pokemon: team
        })
    });
    return handleResponse(response);
};

export const leaveTournament = async (tournamentId: string, trainerId: string): Promise<void> => {
    const response = await fetch(`${API_URL}/tournaments/${tournamentId}/leave`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ trainerId })
    });
    return handleResponse(response);
};

export const startTournament = async (tournamentId: string): Promise<void> => {
    const response = await fetch(`${API_URL}/tournaments/${tournamentId}/start`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
    });
    return handleResponse(response);
};

export const declareMatchWinner = async (tournamentId: string, matchId: string, winners: string[]): Promise<void> => {
    const response = await fetch(`${API_URL}/tournaments/${tournamentId}/matches/${matchId}/win`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ winners })
    });
    return handleResponse(response);
};

export const toggleBan = async (tournamentId: string, matchId: string, targetTrainerId: string, pokemonName: string): Promise<void> => {
    const response = await fetch(`${API_URL}/tournaments/${tournamentId}/matches/${matchId}/ban`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ targetTrainerId, pokemonName })
    });
    return handleResponse(response);
};

// --- INVITES ---
export const getInvites = async (userNick: string): Promise<Invite[]> => {
    const response = await fetch(`${API_URL}/invites?nick=${encodeURIComponent(userNick)}`);
    return handleResponse(response);
};

export const sendInvite = async (tournamentId: string, fromNick: string, toNick: string) => {
    // Need tournament name logic here or let backend handle it.
    // We pass what we have.
    const tournaments = await getTournaments();
    const t = tournaments.find(x => x.id === tournamentId);

    const response = await fetch(`${API_URL}/invites`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            tournamentId,
            tournamentName: t?.name || "Torneio",
            fromNick,
            toNick
        })
    });
    return handleResponse(response);
};

export const respondToInvite = async (inviteId: string, accept: boolean) => {
    const response = await fetch(`${API_URL}/invites/${inviteId}/respond`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ accept })
    });
    return handleResponse(response);
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
