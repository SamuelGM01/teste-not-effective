
import { Trainer, Gym, Tournament, TournamentFormat, Pokemon, Invite, Match } from '../types';

// Define a URL base da API. 
// Em produção (Render), usamos '/api' (caminho relativo).
// Em desenvolvimento (Vite), o proxy do vite.config.ts redireciona '/api' para o backend.
const API_URL = '/api';

// Helper function para fazer as requisições
async function request(endpoint: string, options?: RequestInit) {
    const res = await fetch(`${API_URL}${endpoint}`, {
        headers: { 'Content-Type': 'application/json' },
        ...options
    });
    
    // Tenta ler o JSON
    const data = await res.json().catch(() => ({}));
    
    if (!res.ok) {
        throw new Error(data.error || "Erro de conexão com o servidor");
    }
    return data;
}

// --- TRAINERS ---
export const getTrainers = async (): Promise<Trainer[]> => {
    return request('/trainers');
};

export const createTrainer = async (nick: string, password?: string, customSkin?: string): Promise<Trainer> => {
    return request('/trainers', { 
        method: 'POST', 
        body: JSON.stringify({ nick, password, customSkin }) 
    });
};

export const login = async (nick: string, password: string): Promise<Trainer> => {
    return request('/login', { 
        method: 'POST', 
        body: JSON.stringify({ nick, password }) 
    });
};

export const deleteTrainer = async (id: string): Promise<void> => {
    return request(`/trainers/${id}`, { method: 'DELETE' });
};

export const toggleInsignia = async (trainerId: string, badgeId: string): Promise<Trainer> => {
    return request('/insignias', { 
        method: 'POST', 
        body: JSON.stringify({ trainerId, badgeId }) 
    });
};

// --- GYMS ---
export const getGyms = async (): Promise<Record<string, Gym>> => {
    return request('/gyms');
};

export const updateGym = async (tipo: string, lider: string, time: (any | null)[], liderSkin?: string): Promise<void> => {
    return request('/gyms', { 
        method: 'POST', 
        body: JSON.stringify({ tipo, lider, time, liderSkin }) 
    });
};

export const resetGym = async (tipo: string): Promise<void> => {
    return request('/gyms/reset', { 
        method: 'POST', 
        body: JSON.stringify({ tipo }) 
    });
};

// --- TOURNAMENTS ---
export const getTournaments = async (): Promise<Tournament[]> => {
    return request('/tournaments');
};

export const createTournament = async (name: string, format: TournamentFormat): Promise<Tournament> => {
    return request('/tournaments', { 
        method: 'POST', 
        body: JSON.stringify({ name, format }) 
    });
};

export const joinTournamentMonotype = async (tournamentId: string, trainer: Trainer): Promise<void> => {
    // Validação extra: Buscar gyms atualizados do servidor antes de deixar entrar
    const gyms = await getGyms();
    const userGym = Object.values(gyms).find(g => g.lider.toLowerCase() === trainer.nick.toLowerCase());
    
    if (!userGym) throw new Error("Você precisa ser líder de um ginásio para participar do Monotype!");
    
    const fullTeam = userGym.time.filter((p): p is Pokemon => p !== null);
    if (fullTeam.length < 6) throw new Error("Seu time de ginásio precisa de 6 pokémons.");

    return request(`/tournaments/${tournamentId}/join`, { 
        method: 'POST', 
        body: JSON.stringify({ 
            trainerId: trainer._id, 
            nick: trainer.nick, 
            customSkin: trainer.customSkin,
            pokemon: fullTeam, 
            gymType: userGym.tipo 
        }) 
    });
};

export const joinTournamentDoubles = async (tournamentId: string, trainer: Trainer, team: Pokemon[]): Promise<void> => {
    return request(`/tournaments/${tournamentId}/join`, {
        method: 'POST', 
        body: JSON.stringify({
            trainerId: trainer._id,
            nick: trainer.nick,
            customSkin: trainer.customSkin,
            pokemon: team
        })
    });
};

export const leaveTournament = async (tournamentId: string, trainerId: string): Promise<void> => {
    return request(`/tournaments/${tournamentId}/leave`, { 
        method: 'POST', 
        body: JSON.stringify({ trainerId }) 
    });
};

export const startTournament = async (tournamentId: string): Promise<void> => {
    return request(`/tournaments/${tournamentId}/start`, { method: 'POST' });
};

export const declareMatchWinner = async (tournamentId: string, matchId: string, winners: string[]): Promise<void> => {
    return request(`/tournaments/${tournamentId}/matches/${matchId}/win`, { 
        method: 'POST', 
        body: JSON.stringify({ winners }) 
    });
};

export const toggleBan = async (tournamentId: string, matchId: string, targetTrainerId: string, pokemonName: string): Promise<void> => {
    return request(`/tournaments/${tournamentId}/matches/${matchId}/ban`, { 
        method: 'POST', 
        body: JSON.stringify({ targetTrainerId, pokemonName }) 
    });
};

// --- INVITES ---
export const getInvites = async (userNick: string): Promise<Invite[]> => {
    return request(`/invites?nick=${userNick}`);
};

export const sendInvite = async (tournamentId: string, fromNick: string, toNick: string) => {
    // Buscamos a lista para pegar o nome do torneio (opcional, poderia passar direto)
    const tournaments = await getTournaments();
    const t = tournaments.find(x => x.id === tournamentId);
    
    return request('/invites', { 
        method: 'POST', 
        body: JSON.stringify({ 
            tournamentId, 
            tournamentName: t?.name, 
            fromNick, 
            toNick 
        }) 
    });
};

export const respondToInvite = async (inviteId: string, accept: boolean) => {
    return request(`/invites/${inviteId}/respond`, { 
        method: 'POST', 
        body: JSON.stringify({ accept }) 
    });
};

// --- EXTERNAL API (POKEAPI) ---
// Estas continuam rodando no cliente (browser), pois são públicas
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
    
    // Tenta pegar o GIF animado da Gen 5 (Black/White)
    if(data.sprites.versions && data.sprites.versions['generation-v'] && data.sprites.versions['generation-v']['black-white'].animated.front_default) {
         sprite = data.sprites.versions['generation-v']['black-white'].animated.front_default;
    }
    
    return {
        name: data.name,
        sprite: sprite
    };
};
