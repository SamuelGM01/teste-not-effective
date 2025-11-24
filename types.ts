
export interface Pokemon {
    name: string;
    sprite: string;
}

export interface Gym {
    tipo: string;
    lider: string;
    liderSkin?: string; // Custom skin support
    time: (Pokemon | null)[];
}

export interface Trainer {
    _id: string;
    nick: string;
    insignias: string[];
    password?: string;
    customSkin?: string; // Base64 string for cracked accounts
    dataCriacao?: string;
}

export type TournamentFormat = 'monotype' | 'doubles';
export type TournamentStatus = 'pending' | 'active' | 'completed';

export interface TournamentParticipant {
    trainerId: string;
    nick: string;
    customSkin?: string; // Carry over custom skin
    pokemon: Pokemon[];
    partnerId?: string;
    partnerNick?: string;
    gymType?: string;
}

export interface Match {
    id: string;
    round: number;
    participants: TournamentParticipant[];
    winners: string[]; 
    bans: Record<string, string[]>;
}

export interface Tournament {
    id: string;
    name: string;
    format: TournamentFormat;
    status: TournamentStatus;
    participants: TournamentParticipant[];
    matches: Match[];
    currentRound: number;
    createdAt: number;
}

export interface Invite {
    id: string;
    tournamentId: string;
    tournamentName: string;
    fromNick: string;
    toNick: string;
    status: 'pending' | 'accepted' | 'rejected';
}

export const GYM_TYPES = [
    "agua", "dragao", "eletrico", "fada", "fantasma", "fogo", 
    "gelo", "inseto", "lutador", "metalico", "normal", "pedra", 
    "planta", "psiquico", "sombrio", "terra", "venenoso", "voador"
];

export const TYPE_COLORS: Record<string, string> = {
    agua: "#6390F0",
    dragao: "#6F35FC",
    eletrico: "#F7D02C",
    fada: "#D685AD",
    fantasma: "#735797",
    fogo: "#EE8130",
    gelo: "#96D9D6",
    inseto: "#A6B91A",
    lutador: "#C22E28",
    metalico: "#B7B7CE",
    normal: "#A8A77A",
    pedra: "#B6A136",
    planta: "#7AC74C",
    psiquico: "#F95587",
    sombrio: "#705746",
    terra: "#E2BF65",
    venenoso: "#A33EA1",
    voador: "#A98FF3",
};

const TYPE_TRANSLATIONS: Record<string, string> = {
    agua: "water",
    dragao: "dragon",
    eletrico: "electric",
    fada: "fairy",
    fantasma: "ghost",
    fogo: "fire",
    gelo: "ice",
    inseto: "bug",
    lutador: "fighting",
    metalico: "steel",
    normal: "normal",
    pedra: "rock",
    planta: "grass",
    psiquico: "psychic",
    sombrio: "dark",
    terra: "ground",
    venenoso: "poison",
    voador: "flying",
};

export const getTypeIcon = (type: string) => 
    `https://raw.githubusercontent.com/duiker101/pokemon-type-svg-icons/master/icons/${TYPE_TRANSLATIONS[type]}.svg`;

// Helper to determine skin URL (Custom vs API)
export const getSkinUrl = (nick: string, customSkin?: string, size: number = 100) => {
    if (customSkin) return customSkin;
    return `https://mc-heads.net/avatar/${nick}/${size}`;
};
