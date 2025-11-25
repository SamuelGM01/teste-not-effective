
import { Trainer, Gym, GYM_TYPES, Tournament, TournamentFormat, TournamentParticipant, Pokemon, Invite, Match } from '../types';

const generateId = () => Math.random().toString(36).substr(2, 9);

const TRAINERS_KEY = 'cobblemon_trainers_v2';
const GYMS_KEY = 'cobblemon_gyms_v2';
const TOURNAMENTS_KEY = 'cobblemon_tournaments_v2';
const INVITES_KEY = 'cobblemon_invites_v2';

const initializeGyms = (): Record<string, Gym> => {
    const existing = localStorage.getItem(GYMS_KEY);
    if (existing) return JSON.parse(existing);

    const initialGyms: Record<string, Gym> = {};
    GYM_TYPES.forEach(tipo => {
        initialGyms[tipo] = {
            tipo,
            lider: "",
            time: [null, null, null, null, null, null]
        };
    });
    localStorage.setItem(GYMS_KEY, JSON.stringify(initialGyms));
    return initialGyms;
};

export const getTrainers = async (): Promise<Trainer[]> => {
    const data = localStorage.getItem(TRAINERS_KEY);
    return data ? JSON.parse(data) : [];
};

export const createTrainer = async (nick: string, password?: string, customSkin?: string): Promise<Trainer> => {
    const trainers = await getTrainers();
    
    if (trainers.some(t => t.nick.toLowerCase() === nick.toLowerCase())) {
        throw new Error("Este nick já está em uso!");
    }

    const newTrainer: Trainer = {
        _id: generateId(),
        nick,
        password,
        customSkin, // Save custom skin
        insignias: []
    };
    trainers.push(newTrainer);
    localStorage.setItem(TRAINERS_KEY, JSON.stringify(trainers));
    return newTrainer;
};

export const login = async (nick: string, password: string): Promise<Trainer> => {
    const trainers = await getTrainers();
    const trainer = trainers.find(t => t.nick.toLowerCase() === nick.toLowerCase());
    
    if (!trainer) {
        throw new Error("Treinador não encontrado.");
    }

    if (trainer.password && trainer.password !== password) {
        throw new Error("Senha incorreta.");
    }

    return trainer;
};

export const deleteTrainer = async (id: string): Promise<void> => {
    let trainers = await getTrainers();
    trainers = trainers.filter(t => t._id !== id);
    localStorage.setItem(TRAINERS_KEY, JSON.stringify(trainers));
};

export const toggleInsignia = async (treinadorId: string, insigniaId: string): Promise<Trainer | null> => {
    const trainers = await getTrainers();
    const trainerIndex = trainers.findIndex(t => t._id === treinadorId);
    
    if (trainerIndex === -1) return null;

    const trainer = trainers[trainerIndex];
    if (trainer.insignias.includes(insigniaId)) {
        trainer.insignias = trainer.insignias.filter(id => id !== insigniaId);
    } else {
        trainer.insignias.push(insigniaId);
    }

    trainers[trainerIndex] = trainer;
    localStorage.setItem(TRAINERS_KEY, JSON.stringify(trainers));
    return trainer;
};

export const getGyms = async (): Promise<Record<string, Gym>> => {
    return initializeGyms();
};

export const updateGym = async (tipo: string, lider: string, time: (any | null)[], liderSkin?: string): Promise<void> => {
    const gyms = await getGyms();
    if (gyms[tipo]) {
        gyms[tipo].lider = lider;
        gyms[tipo].liderSkin = liderSkin; // Save leader skin
        gyms[tipo].time = time;
        localStorage.setItem(GYMS_KEY, JSON.stringify(gyms));
    }
};

export const resetGym = async (tipo: string): Promise<void> => {
    const gyms = await getGyms();
    if (gyms[tipo]) {
        gyms[tipo].lider = "";
        gyms[tipo].liderSkin = undefined;
        gyms[tipo].time = [null, null, null, null, null, null];
        localStorage.setItem(GYMS_KEY, JSON.stringify(gyms));
    }
};

export const getTournaments = async (): Promise<Tournament[]> => {
    const data = localStorage.getItem(TOURNAMENTS_KEY);
    return data ? JSON.parse(data) : [];
};

export const createTournament = async (name: string, format: TournamentFormat): Promise<Tournament> => {
    const tournaments = await getTournaments();
    const newTournament: Tournament = {
        id: generateId(),
        name,
        format,
        status: 'pending',
        participants: [],
        matches: [],
        currentRound: 0,
        createdAt: Date.now()
    };
    tournaments.push(newTournament);
    localStorage.setItem(TOURNAMENTS_KEY, JSON.stringify(tournaments));
    return newTournament;
};

export const joinTournamentMonotype = async (tournamentId: string, trainer: Trainer): Promise<void> => {
    const tournaments = await getTournaments();
    const gyms = await getGyms();
    const tIndex = tournaments.findIndex(t => t.id === tournamentId);
    
    if (tIndex === -1) throw new Error("Torneio não encontrado.");
    if (tournaments[tIndex].status !== 'pending') throw new Error("Torneio já iniciado.");
    if (tournaments[tIndex].participants.some(p => p.trainerId === trainer._id)) {
        throw new Error("Você já está inscrito.");
    }

    const userGym = Object.values(gyms).find(g => g.lider.toLowerCase() === trainer.nick.toLowerCase());
    
    if (!userGym) {
        throw new Error("Você precisa ser líder de um ginásio para participar do Monotype!");
    }

    const fullTeam = userGym.time.filter((p): p is Pokemon => p !== null);
    if (fullTeam.length < 6) {
        throw new Error("Você precisa de 6 Pokémons no seu ginásio para participar!");
    }

    tournaments[tIndex].participants.push({
        trainerId: trainer._id,
        nick: trainer.nick,
        customSkin: trainer.customSkin, // Pass custom skin
        pokemon: fullTeam,
        gymType: userGym.tipo
    });

    localStorage.setItem(TOURNAMENTS_KEY, JSON.stringify(tournaments));
};

export const joinTournamentDoubles = async (tournamentId: string, trainer: Trainer, team: Pokemon[]): Promise<void> => {
    const tournaments = await getTournaments();
    const tIndex = tournaments.findIndex(t => t.id === tournamentId);
    
    if (tIndex === -1) throw new Error("Torneio não encontrado.");
    if (tournaments[tIndex].status !== 'pending') throw new Error("Torneio já iniciado.");
    if (team.length !== 4) throw new Error("Você precisa de exatamente 4 Pokémons para Doubles.");
    if (tournaments[tIndex].participants.some(p => p.trainerId === trainer._id)) {
        throw new Error("Você já está inscrito.");
    }

    tournaments[tIndex].participants.push({
        trainerId: trainer._id,
        nick: trainer.nick,
        customSkin: trainer.customSkin, // Pass custom skin
        pokemon: team
    });

    localStorage.setItem(TOURNAMENTS_KEY, JSON.stringify(tournaments));
};

export const leaveTournament = async (tournamentId: string, trainerId: string): Promise<void> => {
    const tournaments = await getTournaments();
    const tIndex = tournaments.findIndex(t => t.id === tournamentId);
    
    if (tIndex === -1) return;
    if (tournaments[tIndex].status !== 'pending') throw new Error("Não é possível sair de um torneio em andamento.");

    const participant = tournaments[tIndex].participants.find(p => p.trainerId === trainerId);
    
    if (participant && participant.partnerId) {
        const partner = tournaments[tIndex].participants.find(p => p.trainerId === participant.partnerId);
        if (partner) {
            partner.partnerId = undefined;
            partner.partnerNick = undefined;
        }
    }

    tournaments[tIndex].participants = tournaments[tIndex].participants.filter(p => p.trainerId !== trainerId);
    localStorage.setItem(TOURNAMENTS_KEY, JSON.stringify(tournaments));
};

export const startTournament = async (tournamentId: string): Promise<void> => {
    const tournaments = await getTournaments();
    const tIndex = tournaments.findIndex(t => t.id === tournamentId);
    const t = tournaments[tIndex];

    if (!t) throw new Error("Torneio não encontrado.");
    if (t.status !== 'pending') throw new Error("Torneio já iniciado.");

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

    t.status = 'active';
    t.currentRound = 1;
    t.matches = newMatches;
    localStorage.setItem(TOURNAMENTS_KEY, JSON.stringify(tournaments));
};

export const declareMatchWinner = async (tournamentId: string, matchId: string, winnerIdOrIds: string[]): Promise<void> => {
    const tournaments = await getTournaments();
    const tIndex = tournaments.findIndex(t => t.id === tournamentId);
    const t = tournaments[tIndex];

    if (!t) throw new Error("Torneio não encontrado.");
    
    const match = t.matches.find(m => m.id === matchId);
    if (!match) throw new Error("Partida não encontrada.");

    match.winners = winnerIdOrIds;

    const roundMatches = t.matches.filter(m => m.round === t.currentRound);
    const allFinished = roundMatches.every(m => m.winners.length > 0);

    if (allFinished) {
        const winnersIds = roundMatches.flatMap(m => m.winners);
        const isOver = t.format === 'monotype' ? winnersIds.length === 1 : winnersIds.length === 2;

        if (isOver) {
            t.status = 'completed';
        } else {
            t.currentRound += 1;
            const nextRoundParticipants = t.participants.filter(p => winnersIds.includes(p.trainerId));
            const shuffled = nextRoundParticipants.sort(() => Math.random() - 0.5);
            
            if (t.format === 'monotype') {
                for (let i = 0; i < shuffled.length; i += 2) {
                    if (i + 1 < shuffled.length) {
                        t.matches.push({
                            id: generateId(),
                            round: t.currentRound,
                            participants: [shuffled[i], shuffled[i+1]],
                            winners: [],
                            bans: {}
                        });
                    } else {
                        t.matches.push({
                            id: generateId(),
                            round: t.currentRound,
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
                        t.matches.push({
                            id: generateId(),
                            round: t.currentRound,
                            participants: [...teams[i], ...teams[i+1]],
                            winners: [],
                            bans: {}
                        });
                    } else {
                         t.matches.push({
                            id: generateId(),
                            round: t.currentRound,
                            participants: [...teams[i]],
                            winners: teams[i].map(p => p.trainerId),
                            bans: {}
                        });
                    }
                }
            }
        }
    }

    localStorage.setItem(TOURNAMENTS_KEY, JSON.stringify(tournaments));
};

export const toggleBan = async (tournamentId: string, matchId: string, targetTrainerId: string, pokemonName: string): Promise<void> => {
    const tournaments = await getTournaments();
    const t = tournaments.find(t => t.id === tournamentId);
    if (!t) return;
    
    const match = t.matches.find(m => m.id === matchId);
    if (!match) return;

    if (!match.bans[targetTrainerId]) {
        match.bans[targetTrainerId] = [];
    }

    const currentBans = match.bans[targetTrainerId];
    const isBanning = !currentBans.includes(pokemonName);

    if (isBanning) {
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

        if (existingTeamBans >= 2) {
            throw new Error("Máximo de 2 bans por equipe atingido!");
        }

        match.bans[targetTrainerId].push(pokemonName);
    } else {
        match.bans[targetTrainerId] = currentBans.filter(n => n !== pokemonName);
    }

    localStorage.setItem(TOURNAMENTS_KEY, JSON.stringify(tournaments));
};

export const getInvites = async (userNick: string): Promise<Invite[]> => {
    const data = localStorage.getItem(INVITES_KEY);
    const invites: Invite[] = data ? JSON.parse(data) : [];
    return invites.filter(i => i.toNick.toLowerCase() === userNick.toLowerCase() && i.status === 'pending');
};

export const sendInvite = async (tournamentId: string, fromNick: string, toNick: string) => {
    const tournaments = await getTournaments();
    const tournament = tournaments.find(t => t.id === tournamentId);
    if (!tournament) throw new Error("Torneio inválido");

    const data = localStorage.getItem(INVITES_KEY);
    const invites: Invite[] = data ? JSON.parse(data) : [];

    if (invites.some(i => i.tournamentId === tournamentId && i.fromNick === fromNick && i.toNick === toNick && i.status === 'pending')) {
        throw new Error("Convite já enviado.");
    }

    invites.push({
        id: generateId(),
        tournamentId,
        tournamentName: tournament.name,
        fromNick,
        toNick,
        status: 'pending'
    });
    localStorage.setItem(INVITES_KEY, JSON.stringify(invites));
};

export const respondToInvite = async (inviteId: string, accept: boolean) => {
    const data = localStorage.getItem(INVITES_KEY);
    let invites: Invite[] = data ? JSON.parse(data) : [];
    const invite = invites.find(i => i.id === inviteId);

    if (!invite) return;

    invite.status = accept ? 'accepted' : 'rejected';
    localStorage.setItem(INVITES_KEY, JSON.stringify(invites));

    if (accept) {
        const tournaments = await getTournaments();
        const tIndex = tournaments.findIndex(t => t.id === invite.tournamentId);
        
        if (tIndex !== -1) {
            const p1Index = tournaments[tIndex].participants.findIndex(p => p.nick === invite.fromNick);
            const p2Index = tournaments[tIndex].participants.findIndex(p => p.nick === invite.toNick);

            if (p1Index !== -1 && p2Index !== -1) {
                const p1 = tournaments[tIndex].participants[p1Index];
                const p2 = tournaments[tIndex].participants[p2Index];

                p1.partnerId = p2.trainerId;
                p1.partnerNick = p2.nick;
                p2.partnerId = p1.trainerId;
                p2.partnerNick = p1.nick;

                localStorage.setItem(TOURNAMENTS_KEY, JSON.stringify(tournaments));
            }
        }
    }
};

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
