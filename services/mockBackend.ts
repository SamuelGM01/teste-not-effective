
import { Trainer, Gym, Tournament, TournamentFormat, Pokemon, Invite, Match } from '../types';

// Define API URL. 
// Uses relative path '/api' which works:
// 1. In Dev: Via Vite Proxy -> forwards to localhost:3000
// 2. In Prod: Via Same Domain (Express serves both)
const API_URL = '/api';

// Helper function for requests
async function request(endpoint: string, options?: RequestInit) {
    try {
        const res = await fetch(`${API_URL}${endpoint}`, {
            headers: { 'Content-Type': 'application/json' },
            ...options
        });
        
        const text = await res.text();
        
        // Check if response is HTML (Common when getting 404 from Vite instead of API)
        if (text.trim().startsWith('<')) {
            console.error("Recebeu HTML em vez de JSON:", text.substring(0, 100));
            throw new Error("O Backend parece estar offline ou retornou erro de página.");
        }

        let data;
        try {
            // Handle empty responses (like 204 No Content or just success: true without body sometimes)
            data = text ? JSON.parse(text) : {};
        } catch (err) {
            throw new Error(`Erro ao processar resposta JSON: ${text.substring(0, 50)}...`);
        }
        
        if (!res.ok) {
            throw new Error(data.error || `Erro da API: ${res.status} ${res.statusText}`);
        }
        return data;
    } catch (error: any) {
        console.error(`Falha na requisição ${endpoint}:`, error);
        throw error; 
    }
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
    // Validar regras de negócio: precisamos saber o ginásio do user
    // Buscamos os ginásios do servidor para garantir dados frescos
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
    // Passa o nick como query param
    return request(`/invites?nick=${encodeURIComponent(userNick)}`);
};

export const sendInvite = async (tournamentId: string, fromNick: string, toNick: string) => {
    // Precisamos do nome do torneio, buscamos a lista
    const tournaments = await getTournaments();
    const t = tournaments.find(x => x.id === tournamentId);
    
    return request('/invites', { 
        method: 'POST', 
        body: JSON.stringify({ 
            tournamentId, 
            tournamentName: t?.name || "Torneio", 
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
// Essas continuam sendo chamadas direto pelo cliente (browser), pois são externas
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
    
    // Tenta pegar sprite animado da Gen 5 se existir
    if(data.sprites.versions && data.sprites.versions['generation-v'] && data.sprites.versions['generation-v']['black-white'].animated.front_default) {
         sprite = data.sprites.versions['generation-v']['black-white'].animated.front_default;
    }
    
    return {
        name: data.name,
        sprite: sprite
    };
};
