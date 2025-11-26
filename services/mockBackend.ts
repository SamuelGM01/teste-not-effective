
import { Trainer, Gym, GYM_TYPES, Tournament, TournamentFormat, TournamentParticipant, Pokemon, Invite, Match, GymBattle } from '../types';
import { v4 as uuidv4 } from 'uuid';

// --- LOCAL STORAGE KEYS ---
const KEYS = {
    TRAINERS: 'cobblemon_trainers_v2',
    GYMS: 'cobblemon_gyms_v2',
    TOURNAMENTS: 'cobblemon_tournaments_v2',
    INVITES: 'cobblemon_invites_v2'
};

// --- HELPER FUNCTIONS ---
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

const getLS = <T>(key: string, defaultVal: T): T => {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : defaultVal;
};

const setLS = (key: string, value: any) => {
    localStorage.setItem(key, JSON.stringify(value));
};

// --- TRAINERS ---
export const getTrainers = async (): Promise<Trainer[]> => {
    await delay(300);
    return getLS<Trainer[]>(KEYS.TRAINERS, []);
};

export const createTrainer = async (nick: string, password?: string, customSkin?: string): Promise<Trainer> => {
    await delay(300);
    const trainers = getLS<Trainer[]>(KEYS.TRAINERS, []);
    
    if (trainers.find(t => t.nick.toLowerCase() === nick.toLowerCase())) {
        throw new Error("Nick já existe!");
    }

    const newTrainer: Trainer = {
        _id: uuidv4(),
        nick,
        password, // In a real app, hash this!
        customSkin,
        insignias: [],
        dataCriacao: new Date().toISOString()
    };

    trainers.push(newTrainer);
    setLS(KEYS.TRAINERS, trainers);
    return newTrainer;
};

export const login = async (nick: string, password?: string): Promise<Trainer> => {
    await delay(300);
    const trainers = getLS<Trainer[]>(KEYS.TRAINERS, []);
    const trainer = trainers.find(t => t.nick.toLowerCase() === nick.toLowerCase());

    if (!trainer) throw new Error("Usuário não encontrado.");
    if (trainer.password !== password) throw new Error("Senha incorreta.");

    return trainer;
};

export const deleteTrainer = async (id: string): Promise<void> => {
    await delay(300);
    let trainers = getLS<Trainer[]>(KEYS.TRAINERS, []);
    trainers = trainers.filter(t => t._id !== id);
    setLS(KEYS.TRAINERS, trainers);
};

export const toggleInsignia = async (trainerId: string, badgeId: string): Promise<Trainer> => {
    await delay(200);
    const trainers = getLS<Trainer[]>(KEYS.TRAINERS, []);
    const trainer = trainers.find(t => t._id === trainerId);
    
    if (!trainer) throw new Error("Treinador não encontrado");

    if (trainer.insignias.includes(badgeId)) {
        trainer.insignias = trainer.insignias.filter(b => b !== badgeId);
    } else {
        trainer.insignias.push(badgeId);
    }

    setLS(KEYS.TRAINERS, trainers);
    return trainer;
};

// --- GYMS ---
const DEFAULT_GYMS: Record<string, Gym> = {};
const GYM_TYPES_ARR = [
    "agua", "dragao", "eletrico", "fada", "fantasma", "fogo", 
    "gelo", "inseto", "lutador", "metalico", "normal", "pedra", 
    "planta", "psiquico", "sombrio", "terra", "venenoso", "voador"
];
GYM_TYPES_ARR.forEach(t => {
    DEFAULT_GYMS[t] = { tipo: t, lider: "", time: [null, null, null, null, null, null], challengers: [], activeBattle: null, history: [] };
});

export const getGyms = async (): Promise<Record<string, Gym>> => {
    await delay(300);
    const stored = getLS<Record<string, Gym>>(KEYS.GYMS, DEFAULT_GYMS);
    // Ensure all types exist and have correct structure (migration safety)
    GYM_TYPES_ARR.forEach(t => {
        if (!stored[t]) stored[t] = { tipo: t, lider: "", time: [null, null, null, null, null, null], challengers: [], activeBattle: null, history: [] };
        if (!stored[t].challengers) stored[t].challengers = [];
        if (!stored[t].activeBattle) stored[t].activeBattle = null;
        if (!stored[t].history) stored[t].history = [];
    });
    return stored;
};

export const updateGym = async (tipo: string, lider: string, time: (any | null)[], liderSkin?: string): Promise<void> => {
    await delay(300);
    const gyms = await getGyms();
    if (gyms[tipo]) {
        gyms[tipo].lider = lider;
        gyms[tipo].liderSkin = liderSkin;
        gyms[tipo].time = time;
        setLS(KEYS.GYMS, gyms);
    }
};

export const resetGym = async (tipo: string): Promise<void> => {
    await delay(300);
    const gyms = await getGyms();
    if (gyms[tipo]) {
        gyms[tipo].lider = "";
        gyms[tipo].liderSkin = undefined;
        gyms[tipo].time = [null, null, null, null, null, null];
        gyms[tipo].challengers = [];
        gyms[tipo].activeBattle = null;
        gyms[tipo].history = [];
        setLS(KEYS.GYMS, gyms);
    }
};

export const toggleGymChallenge = async (tipo: string, nick: string): Promise<void> => {
    await delay(200);
    const gyms = await getGyms();
    const gym = gyms[tipo];
    if (!gym) throw new Error("Ginásio não encontrado");

    if (!gym.challengers) gym.challengers = [];

    if (gym.challengers.includes(nick)) {
        gym.challengers = gym.challengers.filter(c => c !== nick);
    } else {
        gym.challengers.push(nick);
    }
    setLS(KEYS.GYMS, gyms);
};

export const acceptChallenge = async (tipo: string, challengerNick: string, date: string, time: string): Promise<void> => {
    await delay(200);
    const gyms = await getGyms();
    const gym = gyms[tipo];
    if (!gym) return;

    // Remove from waiting list
    if (gym.challengers) {
        gym.challengers = gym.challengers.filter(c => c !== challengerNick);
    }

    // Set active battle
    gym.activeBattle = {
        id: uuidv4(),
        challengerNick,
        date,
        time,
        status: 'scheduled'
    };

    setLS(KEYS.GYMS, gyms);
};

export const resolveBattle = async (tipo: string, result: 'leader_win' | 'challenger_win'): Promise<void> => {
    await delay(200);
    const gyms = await getGyms();
    const gym = gyms[tipo];
    if (!gym || !gym.activeBattle) return;

    const battle = gym.activeBattle;
    battle.status = 'completed';
    battle.result = result;

    if (!gym.history) gym.history = [];
    gym.history.unshift(battle); // Add to start of history
    gym.activeBattle = null; // Clear active

    setLS(KEYS.GYMS, gyms);
};

// --- SERVER STATUS ---
export const getServerStatus = async (): Promise<{ online: boolean, players: number }> => {
    try {
        // This now calls our own backend proxy
        const response = await fetch('/api/server-status');
        if (!response.ok) {
            console.error('Server status API failed:', response.status);
            return { online: false, players: 0 };
        }
        const data = await response.json();
        return {
            online: data.online,
            players: data.players ? data.players.online : 0
        };
    } catch (e) {
        console.error("Error fetching server status:", e);
        return { online: false, players: 0 };
    }
};

// --- TOURNAMENTS ---
export const getTournaments = async (): Promise<Tournament[]> => {
    await delay(300);
    return getLS<Tournament[]>(KEYS.TOURNAMENTS, []);
};

export const createTournament = async (name: string, format: TournamentFormat): Promise<Tournament> => {
    await delay(300);
    const tournaments = getLS<Tournament[]>(KEYS.TOURNAMENTS, []);
    
    const newTournament: Tournament = {
        id: uuidv4(),
        name,
        format,
        status: 'pending',
        participants: [],
        matches: [],
        currentRound: 0,
        createdAt: Date.now()
    };

    tournaments.push(newTournament);
    setLS(KEYS.TOURNAMENTS, tournaments);
    return newTournament;
};

export const joinTournamentMonotype = async (tournamentId: string, trainer: Trainer): Promise<void> => {
    await delay(300);
    const tournaments = getLS<Tournament[]>(KEYS.TOURNAMENTS, []);
    const tournament = tournaments.find(t => t.id === tournamentId);
    
    if (!tournament) throw new Error("Torneio não encontrado");
    if (tournament.participants.some(p => p.trainerId === trainer._id)) {
        throw new Error("Você já está inscrito neste torneio.");
    }

    // Validate Gym Leader Status
    const gyms = await getGyms();
    const userGym = Object.values(gyms).find(g => g && g.lider && g.lider.toLowerCase() === trainer.nick.toLowerCase());

    if (!userGym) throw new Error("Você precisa ser líder de um ginásio para participar do Monotype!");
    
    const fullTeam = userGym.time.filter((p): p is Pokemon => p !== null);
    if (fullTeam.length < 6) throw new Error("Seu time de ginásio precisa de 6 pokémons.");

    tournament.participants.push({
        trainerId: trainer._id,
        nick: trainer.nick,
        customSkin: trainer.customSkin,
        pokemon: fullTeam as Pokemon[],
        gymType: userGym.tipo
    });

    setLS(KEYS.TOURNAMENTS, tournaments);
};

export const joinTournamentDoubles = async (tournamentId: string, trainer: Trainer, team: Pokemon[]): Promise<void> => {
    await delay(300);
    const tournaments = getLS<Tournament[]>(KEYS.TOURNAMENTS, []);
    const tournament = tournaments.find(t => t.id === tournamentId);
    
    if (!tournament) throw new Error("Torneio não encontrado");
    if (tournament.participants.some(p => p.trainerId === trainer._id)) {
        throw new Error("Você já está inscrito neste torneio.");
    }

    tournament.participants.push({
        trainerId: trainer._id,
        nick: trainer.nick,
        customSkin: trainer.customSkin,
        pokemon: team
    });

    setLS(KEYS.TOURNAMENTS, tournaments);
};

export const leaveTournament = async (tournamentId: string, trainerId: string): Promise<void> => {
    await delay(300);
    const tournaments = getLS<Tournament[]>(KEYS.TOURNAMENTS, []);
    const tournament = tournaments.find(t => t.id === tournamentId);
    if (tournament) {
        // Remove partner link if exists
        const me = tournament.participants.find(p => p.trainerId === trainerId);
        if (me && me.partnerId) {
            const partner = tournament.participants.find(p => p.trainerId === me.partnerId);
            if (partner) {
                partner.partnerId = undefined;
                partner.partnerNick = undefined;
            }
        }

        tournament.participants = tournament.participants.filter(p => p.trainerId !== trainerId);
        setLS(KEYS.TOURNAMENTS, tournaments);
    }
};

// --- TOURNAMENT LOGIC (BRACKETS) ---
export const startTournament = async (tournamentId: string): Promise<void> => {
    await delay(500);
    const tournaments = getLS<Tournament[]>(KEYS.TOURNAMENTS, []);
    const tournament = tournaments.find(t => t.id === tournamentId);
    if (!tournament) return;

    if (tournament.participants.length % 2 !== 0) {
        throw new Error("O número de participantes deve ser par.");
    }

    // Shuffle
    const shuffled = [...tournament.participants].sort(() => Math.random() - 0.5);
    const newMatches: Match[] = [];

    if (tournament.format === 'monotype') {
        for (let i = 0; i < shuffled.length; i += 2) {
            newMatches.push({
                id: uuidv4(),
                round: 1,
                participants: [shuffled[i], shuffled[i+1]],
                winners: [],
                bans: {}
            });
        }
    } else {
        // Doubles Logic: Group by partners
        const processedIds = new Set<string>();
        const pairs: TournamentParticipant[][] = [];

        for (const p of shuffled) {
            if (processedIds.has(p.trainerId)) continue;
            
            // Find partner
            const partner = shuffled.find(s => s.trainerId === p.partnerId);
            if (partner) {
                pairs.push([p, partner]);
                processedIds.add(p.trainerId);
                processedIds.add(partner.trainerId);
            }
        }

        // Create matches between pairs
        for (let i = 0; i < pairs.length; i += 2) {
            if (i + 1 < pairs.length) {
                newMatches.push({
                    id: uuidv4(),
                    round: 1,
                    participants: [...pairs[i], ...pairs[i+1]], // Flatten: [Team1P1, Team1P2, Team2P1, Team2P2]
                    winners: [],
                    bans: {}
                });
            }
        }
    }

    tournament.status = 'active';
    tournament.currentRound = 1;
    tournament.matches = newMatches;
    setLS(KEYS.TOURNAMENTS, tournaments);
};

export const declareMatchWinner = async (tournamentId: string, matchId: string, winners: string[]): Promise<void> => {
    await delay(300);
    const tournaments = getLS<Tournament[]>(KEYS.TOURNAMENTS, []);
    const tournament = tournaments.find(t => t.id === tournamentId);
    if (!tournament) return;

    const match = tournament.matches.find(m => m.id === matchId);
    if (!match) return;

    match.winners = winners;

    // Check if round is complete
    const roundMatches = tournament.matches.filter(m => m.round === tournament.currentRound);
    const allFinished = roundMatches.every(m => m.winners.length > 0);

    if (allFinished) {
        const winnersIds = roundMatches.flatMap(m => m.winners);
        
        // Check if tournament is over
        const isOver = tournament.format === 'monotype' ? winnersIds.length === 1 : winnersIds.length === 2;

        if (isOver) {
            tournament.status = 'completed';
        } else {
            // Advance to next round
            tournament.currentRound += 1;
            const nextParticipants = tournament.participants.filter(p => winnersIds.includes(p.trainerId));
            // Shuffle for next round randomness
            const shuffled = nextParticipants.sort(() => Math.random() - 0.5);
            
            if (tournament.format === 'monotype') {
                for (let i = 0; i < shuffled.length; i += 2) {
                    if (i + 1 < shuffled.length) {
                        tournament.matches.push({
                            id: uuidv4(),
                            round: tournament.currentRound,
                            participants: [shuffled[i], shuffled[i+1]],
                            winners: [],
                            bans: {}
                        });
                    } else {
                        // Bye logic (if odd number advances) - Auto win
                        tournament.matches.push({
                            id: uuidv4(),
                            round: tournament.currentRound,
                            participants: [shuffled[i]],
                            winners: [shuffled[i].trainerId],
                            bans: {}
                        });
                    }
                }
            } else {
                // Doubles Next Round
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
                        tournament.matches.push({
                            id: uuidv4(),
                            round: tournament.currentRound,
                            participants: [...teams[i], ...teams[i+1]],
                            winners: [],
                            bans: {}
                        });
                    } else {
                        // Bye for team
                        tournament.matches.push({
                            id: uuidv4(),
                            round: tournament.currentRound,
                            participants: [...teams[i]],
                            winners: teams[i].map(x => x.trainerId),
                            bans: {}
                        });
                    }
                }
            }
        }
    }

    setLS(KEYS.TOURNAMENTS, tournaments);
};

export const toggleBan = async (tournamentId: string, matchId: string, targetTrainerId: string, pokemonName: string): Promise<void> => {
    await delay(200);
    const tournaments = getLS<Tournament[]>(KEYS.TOURNAMENTS, []);
    const tournament = tournaments.find(t => t.id === tournamentId);
    if (!tournament) return;
    const match = tournament.matches.find(m => m.id === matchId);
    if (!match) return;

    if (!match.bans) match.bans = {};
    if (!match.bans[targetTrainerId]) match.bans[targetTrainerId] = [];

    const bans = match.bans[targetTrainerId];
    if (bans.includes(pokemonName)) {
        match.bans[targetTrainerId] = bans.filter(n => n !== pokemonName);
    } else {
        // Limit checking can be done here or UI
        // Doubles logic to check team limit
        let existingTeamBans = 0;
        if (tournament.format === 'doubles') {
            const participants = match.participants;
            const pIndex = participants.findIndex(p => p.trainerId === targetTrainerId);
            let teamIds: string[] = [];
            if (pIndex <= 1) teamIds = [participants[0].trainerId, participants[1].trainerId];
            else teamIds = [participants[2].trainerId, participants[3].trainerId];

            teamIds.forEach(id => {
                if (match.bans[id]) existingTeamBans += match.bans[id].length;
            });
        } else {
            existingTeamBans = bans.length;
        }

        if (existingTeamBans < 2) { 
            match.bans[targetTrainerId].push(pokemonName);
        }
    }
    
    setLS(KEYS.TOURNAMENTS, tournaments);
};

// --- INVITES ---
export const getInvites = async (userNick: string): Promise<Invite[]> => {
    await delay(300);
    const invites = getLS<Invite[]>(KEYS.INVITES, []);
    return invites.filter(i => i.toNick.toLowerCase() === userNick.toLowerCase() && i.status === 'pending');
};

export const sendInvite = async (tournamentId: string, fromNick: string, toNick: string) => {
    await delay(300);
    const invites = getLS<Invite[]>(KEYS.INVITES, []);
    const tournaments = getLS<Tournament[]>(KEYS.TOURNAMENTS, []);
    const t = tournaments.find(x => x.id === tournamentId);

    if (invites.some(i => i.tournamentId === tournamentId && i.fromNick === fromNick && i.toNick === toNick && i.status === 'pending')) {
        throw new Error("Convite já enviado.");
    }

    invites.push({
        id: uuidv4(),
        tournamentId,
        tournamentName: t?.name || "Torneio",
        fromNick,
        toNick,
        status: 'pending'
    });
    setLS(KEYS.INVITES, invites);
};

export const respondToInvite = async (inviteId: string, accept: boolean) => {
    await delay(300);
    let invites = getLS<Invite[]>(KEYS.INVITES, []);
    const inviteIndex = invites.findIndex(i => i.id === inviteId);
    
    if (inviteIndex === -1) return;

    const invite = invites[inviteIndex];
    invite.status = accept ? 'accepted' : 'rejected';
    
    // Remove processed invite from list (or keep history if desired, but for now remove)
    invites = invites.filter(i => i.id !== inviteId); // Clean up processed
    setLS(KEYS.INVITES, invites);

    if (accept) {
        // Perform Pairing
        const tournaments = getLS<Tournament[]>(KEYS.TOURNAMENTS, []);
        const tournament = tournaments.find(t => t.id === invite.tournamentId);
        if (tournament) {
            const p1 = tournament.participants.find(p => p.nick === invite.fromNick);
            const p2 = tournament.participants.find(p => p.nick === invite.toNick);

            if (p1 && p2) {
                p1.partnerId = p2.trainerId;
                p1.partnerNick = p2.nick;
                p2.partnerId = p1.trainerId;
                p2.partnerNick = p1.nick;
                setLS(KEYS.TOURNAMENTS, tournaments);
            }
        }
    }
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
