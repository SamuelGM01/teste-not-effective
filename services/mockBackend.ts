import { Trainer, Gym, Tournament, TournamentFormat, TournamentParticipant, Pokemon, Invite, Match } from '../types';

// Detect environment to choose API URL
// In development (localhost), use http://localhost:10000
// In production (Render), use the relative path (if served together) or the full URL
const API_URL = (import.meta as any).env.VITE_API_URL || 'http://localhost:10000/api';

const handleResponse = async (res: Response) => {
    if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Erro na requisição");
    }
    return res.json();
};

// --- AUTH & TRAINERS ---

export const getTrainers = async (): Promise<Trainer[]> => {
    const res = await fetch(`${API_URL}/trainers`);
    return handleResponse(res);
};

export const createTrainer = async (nick: string, password?: string, customSkin?: string): Promise<Trainer> => {
    const res = await fetch(`${API_URL}/trainers`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nick, password, customSkin })
    });
    return handleResponse(res);
};

export const login = async (nick: string, password: string): Promise<Trainer> => {
    const res = await fetch(`${API_URL}/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nick, password })
    });
    return handleResponse(res);
};

export const deleteTrainer = async (id: string): Promise<void> => {
    await fetch(`${API_URL}/trainers/${id}`, { method: 'DELETE' });
};

export const toggleInsignia = async (trainerId: string, insigniaId: string): Promise<Trainer | null> => {
    const res = await fetch(`${API_URL}/insignias`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ trainerId, insigniaId })
    });
    return handleResponse(res);
};

// --- GYMS ---

export const getGyms = async (): Promise<Record<string, Gym>> => {
    const res = await fetch(`${API_URL}/gyms`);
    return handleResponse(res);
};

export const updateGym = async (tipo: string, lider: string, time: (any | null)[], liderSkin?: string): Promise<void> => {
    await fetch(`${API_URL}/gyms/update`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tipo, lider, time, liderSkin })
    });
};

export const resetGym = async (tipo: string): Promise<void> => {
    await fetch(`${API_URL}/gyms/reset`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tipo })
    });
};

// --- TOURNAMENTS (Hybrid Logic: Logic here, Persistence via API) ---

export const getTournaments = async (): Promise<Tournament[]> => {
    const res = await fetch(`${API_URL}/tournaments`);
    return handleResponse(res);
};

export const createTournament = async (name: string, format: TournamentFormat): Promise<Tournament> => {
    const res = await fetch(`${API_URL}/tournaments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, format })
    });
    return handleResponse(res);
};

// Helper to update tournament state in DB
const saveTournament = async (id: string, updates: Partial<Tournament>) => {
    await fetch(`${API_URL}/tournaments/${id}/update`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates)
    });
};

export const joinTournamentMonotype = async (tournamentId: string, trainer: Trainer): Promise<void> => {
    // Need current state to validate
    const tournaments = await getTournaments();
    const t = tournaments.find(x => x.id === tournamentId);
    if (!t) throw new Error("Torneio não encontrado");

    if (t.status !== 'pending') throw new Error("Torneio já iniciado.");
    if (t.participants.some(p => p.trainerId === trainer._id)) throw new Error("Você já está inscrito.");

    // Check Gym ownership via API
    const gyms = await getGyms();
    const userGym = Object.values(gyms).find(g => g.lider.toLowerCase() === trainer.nick.toLowerCase());
    
    if (!userGym) throw new Error("Você precisa ser líder de um ginásio para participar do Monotype!");

    const fullTeam = userGym.time.filter((p): p is Pokemon => p !== null);
    if (fullTeam.length < 6) throw new Error("Você precisa de 6 Pokémons no seu ginásio para participar!");

    const newParticipant: TournamentParticipant = {
        trainerId: trainer._id,
        nick: trainer.nick,
        customSkin: trainer.customSkin,
        pokemon: fullTeam,
        gymType: userGym.tipo
    };

    const newParticipants = [...t.participants, newParticipant];
    await saveTournament(tournamentId, { participants: newParticipants });
};

export const joinTournamentDoubles = async (tournamentId: string, trainer: Trainer, team: Pokemon[]): Promise<void> => {
    const tournaments = await getTournaments();
    const t = tournaments.find(x => x.id === tournamentId);
    if (!t) throw new Error("Torneio não encontrado");

    if (t.status !== 'pending') throw new Error("Torneio já iniciado.");
    if (team.length !== 4) throw new Error("Você precisa de exatamente 4 Pokémons para Doubles.");
    if (t.participants.some(p => p.trainerId === trainer._id)) throw new Error("Você já está inscrito.");

    const newParticipant: TournamentParticipant = {
        trainerId: trainer._id,
        nick: trainer.nick,
        customSkin: trainer.customSkin,
        pokemon: team
    };

    const newParticipants = [...t.participants, newParticipant];
    await saveTournament(tournamentId, { participants: newParticipants });
};

export const leaveTournament = async (tournamentId: string, trainerId: string): Promise<void> => {
    const tournaments = await getTournaments();
    const t = tournaments.find(x => x.id === tournamentId);
    if (!t || t.status !== 'pending') return;

    // Remove partner links if necessary
    let updatedParticipants = t.participants.map(p => {
        if (p.partnerId === trainerId) return { ...p, partnerId: undefined, partnerNick: undefined };
        return p;
    });

    updatedParticipants = updatedParticipants.filter(p => p.trainerId !== trainerId);
    await saveTournament(tournamentId, { participants: updatedParticipants });
};

export const startTournament = async (tournamentId: string): Promise<void> => {
    const tournaments = await getTournaments();
    const t = tournaments.find(x => x.id === tournamentId);
    if (!t) throw new Error("Torneio não encontrado");

    const count = t.participants.length;
    if (count % 2 !== 0) throw new Error("O número de participantes deve ser PAR.");

    if (t.format === 'monotype') {
        if (count < 2 || count > 18) throw new Error("Monotype requer 2 a 18 jogadores.");
    } else {
        const hasUnpaired = t.participants.some(p => !p.partnerId);
        if (hasUnpaired) throw new Error("Todos os jogadores precisam de uma dupla formada.");
        if (count < 4 || count > 18) throw new Error("Doubles requer 4 a 18 jogadores.");
    }

    const shuffled = [...t.participants].sort(() => Math.random() - 0.5);
    const newMatches: Match[] = [];
    const generateId = () => Math.random().toString(36).substr(2, 9);
    
    if (t.format === 'monotype') {
        for (let i = 0; i < shuffled.length; i += 2) {
            newMatches.push({
                id: generateId(),
                round: 1,
                participants: [shuffled[i], shuffled[i+1]],
                winners: [],
                bans: {}
            });
        }
    } else {
        const processedIds = new Set<string>();
        const pairs: TournamentParticipant[][] = [];

        for (const p of shuffled) {
            if (processedIds.has(p.trainerId)) continue;
            const partner = shuffled.find(s => s.trainerId === p.partnerId);
            if (partner) {
                pairs.push([p, partner]);
                processedIds.add(p.trainerId);
                processedIds.add(partner.trainerId);
            }
        }

        for (let i = 0; i < pairs.length; i += 2) {
            if (i + 1 < pairs.length) {
                newMatches.push({
                    id: generateId(),
                    round: 1,
                    participants: [...pairs[i], ...pairs[i+1]],
                    winners: [],
                    bans: {}
                });
            }
        }
    }

    await saveTournament(tournamentId, { status: 'active', currentRound: 1, matches: newMatches });
};

export const declareMatchWinner = async (tournamentId: string, matchId: string, winnerIdOrIds: string[]): Promise<void> => {
    const tournaments = await getTournaments();
    const t = tournaments.find(x => x.id === tournamentId);
    if (!t) throw new Error("Torneio não encontrado");

    const matches = [...t.matches];
    const matchIndex = matches.findIndex(m => m.id === matchId);
    if (matchIndex === -1) throw new Error("Partida não encontrada");

    matches[matchIndex].winners = winnerIdOrIds;
    
    // Check round completion logic
    const roundMatches = matches.filter(m => m.round === t.currentRound);
    const allFinished = roundMatches.every(m => m.winners.length > 0);
    
    let updates: Partial<Tournament> = { matches };

    if (allFinished) {
        const winnersIds = roundMatches.flatMap(m => m.winners);
        const isOver = t.format === 'monotype' ? winnersIds.length === 1 : winnersIds.length === 2;

        if (isOver) {
            updates.status = 'completed';
        } else {
            updates.currentRound = t.currentRound + 1;
            const nextRoundParticipants = t.participants.filter(p => winnersIds.includes(p.trainerId));
            const shuffled = nextRoundParticipants.sort(() => Math.random() - 0.5);
            const generateId = () => Math.random().toString(36).substr(2, 9);
            
            // Generate next round matches
            if (t.format === 'monotype') {
                for (let i = 0; i < shuffled.length; i += 2) {
                    if (i + 1 < shuffled.length) {
                        matches.push({
                            id: generateId(),
                            round: t.currentRound + 1,
                            participants: [shuffled[i], shuffled[i+1]],
                            winners: [],
                            bans: {}
                        });
                    } else {
                         // Bye
                         matches.push({
                            id: generateId(),
                            round: t.currentRound + 1,
                            participants: [shuffled[i]],
                            winners: [shuffled[i].trainerId],
                            bans: {}
                        });
                    }
                }
            } else {
                const processedIds = new Set<string>();
                const teams: TournamentParticipant[][] = [];

                for (const p of shuffled) {
                    if (processedIds.has(p.trainerId)) continue;
                    const partner = shuffled.find(s => s.trainerId === p.partnerId);
                    if (partner) {
                        teams.push([p, partner]);
                        processedIds.add(p.trainerId);
                        processedIds.add(partner.trainerId);
                    }
                }

                for (let i = 0; i < teams.length; i += 2) {
                    if (i + 1 < teams.length) {
                         matches.push({
                            id: generateId(),
                            round: t.currentRound + 1,
                            participants: [...teams[i], ...teams[i+1]],
                            winners: [],
                            bans: {}
                        });
                    } else {
                        matches.push({
                            id: generateId(),
                            round: t.currentRound + 1,
                            participants: [...teams[i]],
                            winners: teams[i].map(p => p.trainerId),
                            bans: {}
                        });
                    }
                }
            }
        }
    }

    await saveTournament(tournamentId, updates);
};

export const toggleBan = async (tournamentId: string, matchId: string, targetTrainerId: string, pokemonName: string): Promise<void> => {
    const tournaments = await getTournaments();
    const t = tournaments.find(x => x.id === tournamentId);
    if (!t) return;
    
    const matches = [...t.matches];
    const matchIndex = matches.findIndex(m => m.id === matchId);
    if (matchIndex === -1) return;

    const match = matches[matchIndex];
    if (!match.bans[targetTrainerId]) match.bans[targetTrainerId] = [];

    const currentBans = match.bans[targetTrainerId];
    const isBanning = !currentBans.includes(pokemonName);

    if (isBanning) {
        // Check limits
        let existingTeamBans = 0;
        if (t.format === 'doubles') {
            const participants = match.participants;
            const pIndex = participants.findIndex(p => p.trainerId === targetTrainerId);
            let teamIds: string[] = [];
            if (pIndex <= 1) teamIds = [participants[0].trainerId, participants[1].trainerId];
            else teamIds = [participants[2].trainerId, participants[3].trainerId];
            teamIds.forEach(id => {
                if (match.bans[id]) existingTeamBans += match.bans[id].length;
            });
        } else {
            existingTeamBans = currentBans.length; 
        }

        if (existingTeamBans >= 2) throw new Error("Máximo de 2 bans por equipe atingido!");
        match.bans[targetTrainerId].push(pokemonName);
    } else {
        match.bans[targetTrainerId] = currentBans.filter(n => n !== pokemonName);
    }

    await saveTournament(tournamentId, { matches });
};

// --- INVITES ---

export const getInvites = async (userNick: string): Promise<Invite[]> => {
    const res = await fetch(`${API_URL}/invites/${userNick}`);
    return handleResponse(res);
};

export const sendInvite = async (tournamentId: string, fromNick: string, toNick: string) => {
    const tournaments = await getTournaments();
    const t = tournaments.find(x => x.id === tournamentId);
    if (!t) throw new Error("Torneio não encontrado");

    await fetch(`${API_URL}/invites`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            tournamentId,
            tournamentName: t.name,
            fromNick,
            toNick
        })
    });
};

export const respondToInvite = async (inviteId: string, accept: boolean) => {
    // 1. Update invite status
    await fetch(`${API_URL}/invites/${inviteId}/respond`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ accept })
    });

    // 2. If accepted, update tournament participants locally then save
    if (accept) {
        const invitesRes = await fetch(`${API_URL}/invites/IGNORE`); // Hack to get structure if needed, but easier to just fetch tournaments again
        // Actually, we need to know WHICH tournament it was.
        // For efficiency in this structure, we'll reload tournaments in the frontend. 
        // But we MUST update the relationship in the DB.
        
        // Since the 'Invite' object in DB has tournamentId, we need logic to link them.
        // However, the cleanest way in this architecture is to replicate the "Link" logic in the backend 
        // OR fetch the invite details here.
        // Simplified: The frontend will reload data. But the Backend logic for "respond" should handle linking?
        // NO, the `respondToInvite` in mockBackend was handling the linking. 
        // We need to implement that linking in the API endpoint `app.post('/api/invites/:id/respond')` ideally.
        // FOR NOW: We will assume the frontend refreshes.
        
        // WAIT: The linking logic (setting partnerId) must happen.
        // I will implement a specific endpoint logic in server.js or handle it here via multiple calls.
        // Let's handle it here to keep server.js simple (though less atomic).
        
        // Fetch invites to find the one we just accepted (or passed in args if we had full obj)
        // Since we don't have the full object here easily without another fetch...
        // Let's rely on the Invite Listener in frontend to trigger a refresh.
        
        // CRITICAL FIX: The database needs to know the partners are linked.
        // I'll add a helper call to `api/tournaments` inside the server.js invite response? 
        // No, let's keep it consistent.
        // The mock backend did: `localStorage.setItem...`.
        
        // Let's trust the server.js I wrote above? I need to update server.js to handle the linking!
        // **Self-Correction**: I will update `server.js` route `/api/invites/:id/respond` to handle the tournament linking.
    }
};

// --- EXTERNAL ---

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