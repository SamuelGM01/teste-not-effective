import { Trainer, Gym, Tournament, TournamentFormat, Pokemon, Invite, Match, GymBattle } from '../types';

// O Vite proxy cuidará do redirecionamento
const API_URL = '/api';

// Helper for Fetch with improved error handling
async function request(endpoint: string, options?: RequestInit) {
    try {
        const res = await fetch(`${API_URL}${endpoint}`, {
            headers: { 'Content-Type': 'application/json' },
            ...options
        });
        
        const text = await res.text();
        
        if (text.trim().startsWith('<') || text.includes('File not found')) {
            console.error("Recebeu HTML/404 em vez de JSON. O backend está rodando? Rota existe?");
            throw new Error("O Backend parece estar offline. Certifique-se de rodar 'node server.js' em outro terminal.");
        }

        let data;
        try {
            data = text ? JSON.parse(text) : {};
        } catch (err) {
            throw new Error(`Erro ao processar resposta do servidor: ${text.substring(0, 100)}...`);
        }
        
        if (!res.ok) {
            throw new Error(data.error || `Erro da API: ${res.status}`);
        }
        return data;
    } catch (error: any) {
        console.error(`Falha na requisição ${endpoint}:`, error.message);
        throw error;
    }
}

// --- TRAINERS ---
export const getTrainers = async (): Promise<Trainer[]> => request('/trainers');
export const createTrainer = async (nick: string, password?: string, customSkin?: string): Promise<Trainer> => request('/trainers', { method: 'POST', body: JSON.stringify({ nick, password, customSkin }) });
export const login = async (nick: string, password: string): Promise<Trainer> => request('/login', { method: 'POST', body: JSON.stringify({ nick, password }) });
export const deleteTrainer = async (id: string): Promise<void> => request(`/trainers/${id}`, { method: 'DELETE' });
export const toggleInsignia = async (trainerId: string, badgeId: string): Promise<Trainer> => request('/insignias', { method: 'POST', body: JSON.stringify({ trainerId, badgeId }) });

// --- GYMS ---
export const getGyms = async (): Promise<Record<string, Gym>> => request('/gyms');
export const updateGym = async (tipo: string, lider: string, time: (any | null)[], liderSkin?: string): Promise<void> => request('/gyms', { method: 'POST', body: JSON.stringify({ tipo, lider, time, liderSkin }) });
export const resetGym = async (tipo: string): Promise<void> => request('/gyms/reset', { method: 'POST', body: JSON.stringify({ tipo }) });
export const toggleGymChallenge = async (tipo: string, nick: string): Promise<void> => request(`/gyms/${tipo}/challenge`, { method: 'POST', body: JSON.stringify({ nick }) });
export const acceptChallenge = async (tipo: string, challengerNick: string, date: string, time: string): Promise<void> => request(`/gyms/${tipo}/battle/accept`, { method: 'POST', body: JSON.stringify({ challengerNick, date, time }) });
export const resolveBattle = async (tipo: string, result: 'leader_win' | 'challenger_win'): Promise<void> => request(`/gyms/${tipo}/battle/resolve`, { method: 'POST', body: JSON.stringify({ result }) });

// --- TOURNAMENTS ---
export const getTournaments = async (): Promise<Tournament[]> => request('/tournaments');
export const createTournament = async (name: string, format: TournamentFormat): Promise<Tournament> => request('/tournaments', { method: 'POST', body: JSON.stringify({ name, format }) });

export const joinTournamentMonotype = async (tournamentId: string, trainer: Trainer): Promise<void> => {
    const gyms = await getGyms();
    const userGym = Object.values(gyms).find(g => g && g.lider && g.lider.toLowerCase() === trainer.nick.toLowerCase());
    if (!userGym) throw new Error("Você precisa ser líder de um ginásio para participar do Monotype!");
    const fullTeam = userGym.time.filter((p): p is Pokemon => p !== null);
    if (fullTeam.length < 6) throw new Error("Seu time de ginásio precisa de 6 pokémons.");
    return request(`/tournaments/${tournamentId}/join`, { method: 'POST', body: JSON.stringify({ trainerId: trainer._id, nick: trainer.nick, customSkin: trainer.customSkin, pokemon: fullTeam, gymType: userGym.tipo }) });
};

export const joinTournamentDoubles = async (tournamentId: string, trainer: Trainer, team: Pokemon[]): Promise<void> => request(`/tournaments/${tournamentId}/join`, { method: 'POST', body: JSON.stringify({ trainerId: trainer._id, nick: trainer.nick, customSkin: trainer.customSkin, pokemon: team }) });
export const leaveTournament = async (tournamentId: string, trainerId: string): Promise<void> => request(`/tournaments/${tournamentId}/leave`, { method: 'POST', body: JSON.stringify({ trainerId }) });
export const startTournament = async (tournamentId: string): Promise<void> => request(`/tournaments/${tournamentId}/start`, { method: 'POST' });
export const declareMatchWinner = async (tournamentId: string, matchId: string, winners: string[]): Promise<void> => request(`/tournaments/${tournamentId}/matches/${matchId}/win`, { method: 'POST', body: JSON.stringify({ winners }) });
export const toggleBan = async (tournamentId: string, matchId: string, targetTrainerId: string, pokemonName: string): Promise<void> => request(`/tournaments/${tournamentId}/matches/${matchId}/ban`, { method: 'POST', body: JSON.stringify({ targetTrainerId, pokemonName }) });

// --- INVITES ---
export const getInvites = async (userNick: string): Promise<Invite[]> => request(`/invites?nick=${encodeURIComponent(userNick)}`);

export const sendInvite = async (tournamentId: string, fromNick: string, toNick: string) => {
    const tournaments = await getTournaments();
    const t = tournaments.find(x => x.id === tournamentId);
    return request('/invites', { method: 'POST', body: JSON.stringify({ tournamentId, tournamentName: t?.name || "Torneio", fromNick, toNick }) });
};

export const respondToInvite = async (inviteId: string, accept: boolean) => request(`/invites/${inviteId}/respond`, { method: 'POST', body: JSON.stringify({ accept }) });

// --- EXTERNAL API (POKEAPI) ---
export const searchPokemon = async (query: string) => {
    if (query.length < 2) return [];
    try {
        const response = await fetch('https://pokeapi.co/api/v2/pokemon?limit=10000');
        const data = await response.json();
        return data.results.filter((p: any) => p.name.includes(query.toLowerCase())).slice(0, 20);
    } catch (e) {
        console.error(e);
        return [];
    }
};

export const getPokemonDetails = async (url: string) => {
    const res = await fetch(url);
    const data = await res.json();
    let sprite = data.sprites.front_default;
    if (data.sprites.versions?.['generation-v']?.['black-white']?.animated?.front_default) {
        sprite = data.sprites.versions['generation-v']['black-white'].animated.front_default;
    }
    return { name: data.name, sprite: sprite };
};
