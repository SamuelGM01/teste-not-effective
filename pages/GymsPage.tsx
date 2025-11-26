
import React, { useEffect, useState } from 'react';
import { GYM_TYPES, Gym, TYPE_COLORS, getTypeIcon, getSkinUrl, GymBattle } from '../types';
import * as api from '../services/mockBackend';
import { useAuth } from '../contexts/AuthContext';
import { X, Search, Lock, Zap, Ghost, Snowflake, Bug, HandMetal, Settings, Wind, Cloud, Droplets, Leaf, Eye, Sparkles, Hexagon, Circle, Triangle, AlertCircle, WifiOff, Swords, Users, Flag, Calendar, Clock, History, Trophy, Skull, Crown, User } from 'lucide-react';

const GymBackgroundEffect: React.FC<{ type: string }> = ({ type }) => {
    switch (type) {
        case 'eletrico': 
            return (
                <div className="absolute inset-0 overflow-hidden pointer-events-none bg-blue-950/40">
                    <div className="absolute inset-0 bg-yellow-400/5 animate-flicker" />
                    {[...Array(4)].map((_, i) => (
                        <div 
                            key={i}
                            className="absolute bg-white animate-flash"
                            style={{
                                width: '2px',
                                height: '200px',
                                top: `${Math.random() * 80 - 20}%`,
                                left: `${Math.random() * 100}%`,
                                transform: `rotate(${Math.random() * 60 - 30}deg)`,
                                animationDelay: `${Math.random() * 2}s`,
                                boxShadow: '0 0 15px 2px rgba(255, 255, 0, 0.8)'
                            }}
                        />
                    ))}
                    <div className="absolute inset-0 flex items-center justify-center opacity-10 animate-pulse-fast">
                        <Zap size={300} fill="yellow" className="text-yellow-500 blur-md" />
                    </div>
                </div>
            );

        case 'fantasma': 
            return (
                <div className="absolute inset-0 overflow-hidden pointer-events-none bg-purple-950/80">
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-purple-900/30 to-transparent animate-fog-flow" />
                    <div className="absolute inset-0 bg-gradient-to-l from-transparent via-gray-900/40 to-transparent animate-fog-flow" style={{ animationDuration: '15s' }} />
                    {[...Array(6)].map((_, i) => (
                        <div 
                            key={i} 
                            className="absolute flex gap-2 animate-flash opacity-0"
                            style={{ 
                                top: `${20 + Math.random() * 60}%`, 
                                left: `${Math.random() * 90}%`, 
                                animationDelay: `${Math.random() * 5}s`,
                                animationDuration: '4s'
                            }}
                        >
                            <div className="w-2 h-2 rounded-full bg-red-500 shadow-[0_0_8px_red]" />
                            <div className="w-2 h-2 rounded-full bg-red-500 shadow-[0_0_8px_red]" />
                        </div>
                    ))}
                </div>
            );

        case 'inseto': 
            return (
                <div className="absolute inset-0 overflow-hidden pointer-events-none bg-lime-950/60">
                    <div 
                        className="absolute inset-0 opacity-10" 
                        style={{
                            backgroundImage: 'radial-gradient(circle, #84cc16 1px, transparent 1px)',
                            backgroundSize: '30px 30px'
                        }} 
                    />
                    {[...Array(20)].map((_, i) => (
                        <div 
                            key={i} 
                            className="absolute w-1 h-1 bg-lime-400 rounded-full animate-swarm opacity-60"
                            style={{ 
                                top: `${Math.random() * 100}%`, 
                                left: `${Math.random() * 100}%`, 
                                animationDelay: `${Math.random() * 5}s`,
                                animationDuration: `${3 + Math.random() * 2}s`
                            }}
                        />
                    ))}
                    <div className="absolute -bottom-10 -right-10 text-lime-900/30">
                        <Hexagon size={200} fill="currentColor" />
                    </div>
                </div>
            );

        case 'dragao': 
            return (
                <div className="absolute inset-0 overflow-hidden pointer-events-none bg-indigo-950/60">
                    {[...Array(15)].map((_, i) => (
                        <div 
                            key={i}
                            className="absolute bg-indigo-500/30 w-4 h-4 rounded-full blur-sm animate-rise"
                            style={{
                                left: `${Math.random() * 100}%`,
                                animationDuration: `${2 + Math.random()}s`,
                                animationDelay: `${Math.random() * 2}s`
                            }}
                        />
                    ))}
                    <div className="absolute top-1/4 left-0 w-full h-full flex items-center justify-center">
                         <div className="relative w-64 h-64">
                            {[0, 1, 2].map((i) => (
                                <div 
                                    key={i}
                                    className="absolute bg-red-600/60 h-1 w-full animate-slash shadow-[0_0_15px_red]"
                                    style={{
                                        top: `${30 + i * 20}px`,
                                        transform: 'rotate(-45deg)',
                                        animationDelay: `${i * 0.1}s`,
                                        clipPath: 'polygon(0 0, 100% 0, 100% 100%, 0 100%)' 
                                    }}
                                />
                            ))}
                         </div>
                    </div>
                </div>
            );

        case 'fada': 
            return (
                <div className="absolute inset-0 overflow-hidden pointer-events-none bg-pink-950/40">
                     <div className="absolute inset-0 bg-gradient-to-tr from-pink-500/10 via-transparent to-blue-500/10 animate-pulse-glow" />
                     {[...Array(12)].map((_, i) => (
                        <Sparkles 
                            key={i}
                            className="absolute text-pink-300 animate-twinkle"
                            size={16 + Math.random() * 24}
                            style={{
                                top: `${Math.random() * 100}%`,
                                left: `${Math.random() * 100}%`,
                                animationDelay: `${Math.random() * 3}s`,
                                animationDuration: `${2 + Math.random() * 2}s`
                            }}
                        />
                     ))}
                     <div className="absolute top-0 left-0 w-32 h-32 bg-pink-500/20 rounded-full blur-3xl animate-float" />
                     <div className="absolute bottom-0 right-0 w-40 h-40 bg-purple-500/20 rounded-full blur-3xl animate-float" style={{ animationDelay: '2s' }} />
                </div>
            );

        case 'lutador': 
            return (
                <div className="absolute inset-0 overflow-hidden pointer-events-none bg-orange-950/80">
                    <div className="absolute inset-0 bg-gradient-to-b from-orange-900/50 to-transparent" />
                    
                    {/* Punching Bag Animation */}
                    <div 
                        className="absolute top-0 left-1/2 -translate-x-1/2 w-40 h-[60%] origin-top animate-shake" 
                        style={{ animationDuration: '3s', animationTimingFunction: 'ease-in-out' }}
                    >
                        {/* Chain */}
                        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-1 h-20 bg-neutral-400" />
                        
                        {/* Bag Body */}
                        <div className="absolute top-20 left-1/2 -translate-x-1/2 w-32 h-64 bg-red-800 rounded-b-3xl rounded-t-lg border-4 border-red-950 shadow-xl flex items-center justify-center overflow-hidden">
                            <div className="absolute inset-0 bg-gradient-to-r from-black/30 to-transparent" />
                            <div className="w-20 h-20 border-4 border-red-900/50 rounded-full opacity-50" />
                        </div>
                    </div>

                    {/* Sweat/Impact particles */}
                    {[...Array(5)].map((_, i) => (
                        <div 
                            key={i}
                            className="absolute top-1/2 left-1/2 w-2 h-2 bg-blue-200 rounded-full animate-fly-out opacity-0"
                            style={{
                                animation: `shockwave 1s infinite`,
                                animationDelay: `${i * 0.5}s`,
                                transform: `rotate(${Math.random() * 360}deg) translateX(60px)`
                            }}
                        />
                    ))}
                </div>
            );

        case 'pedra': 
            return (
                <div className="absolute inset-0 overflow-hidden pointer-events-none bg-stone-900/80">
                    {[...Array(8)].map((_, i) => (
                        <div 
                            key={i}
                            className="absolute animate-tumble opacity-0 text-stone-600"
                            style={{
                                left: `${Math.random() * 100}%`,
                                animationDelay: `${Math.random() * 5}s`,
                                animationDuration: `${2 + Math.random() * 2}s`
                            }}
                        >
                            <div className="relative">
                                {i % 2 === 0 ? <Hexagon fill="currentColor" size={20 + Math.random() * 30} /> : <Triangle fill="currentColor" size={20 + Math.random() * 30} />}
                            </div>
                        </div>
                    ))}
                    <div className="absolute bottom-0 w-full h-20 bg-gradient-to-t from-stone-700/50 to-transparent blur-md animate-pulse" />
                </div>
            );

        case 'psiquico': 
            return (
                <div className="absolute inset-0 overflow-hidden pointer-events-none bg-fuchsia-950/60">
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[200%] h-[200%]">
                        {[...Array(4)].map((_, i) => (
                            <div 
                                key={i}
                                className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full border border-fuchsia-500/30 animate-shockwave"
                                style={{
                                    animationDuration: '6s',
                                    animationDelay: `${i * 1.5}s`
                                }}
                            />
                        ))}
                    </div>
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 animate-float">
                        <Eye size={120} className="text-pink-500/20" />
                    </div>
                </div>
            );

        case 'gelo': 
            return (
                <div className="absolute inset-0 overflow-hidden pointer-events-none">
                    <div className="absolute inset-0 bg-cyan-950/20" />
                    {[...Array(12)].map((_, i) => (
                        <div 
                            key={i} 
                            className="absolute animate-snow opacity-0 text-cyan-200/40"
                            style={{ 
                                left: `${Math.random() * 100}%`, 
                                animationDelay: `${Math.random() * 5}s`,
                                animationDuration: `${3 + Math.random() * 4}s`
                            }}
                        >
                            <Snowflake size={16 + Math.random() * 16} />
                        </div>
                    ))}
                </div>
            );

        case 'metalico': 
            return (
                <div className="absolute inset-0 overflow-hidden pointer-events-none">
                    <div className="absolute inset-0 bg-slate-800/20" />
                    <Settings 
                        className="absolute -top-10 -left-10 text-slate-500/20 animate-spin-slow" 
                        size={150} 
                    />
                    <Settings 
                        className="absolute -bottom-10 -right-10 text-slate-500/20 animate-spin-slow" 
                        size={200} 
                        style={{ animationDirection: 'reverse' }}
                    />
                     <Settings 
                        className="absolute top-1/2 left-1/2 text-slate-400/10 animate-spin-slow" 
                        size={80} 
                    />
                </div>
            );

        case 'planta': 
            return (
                <div className="absolute inset-0 overflow-hidden pointer-events-none">
                    <div className="absolute inset-0 bg-green-900/10" />
                    {[...Array(8)].map((_, i) => (
                        <div 
                            key={i} 
                            className="absolute animate-fall-sway opacity-0 text-green-500/40"
                            style={{ 
                                left: `${Math.random() * 100}%`, 
                                animationDelay: `${Math.random() * 5}s`
                            }}
                        >
                            <Leaf size={20} fill="currentColor" />
                        </div>
                    ))}
                </div>
            );

        case 'terra': 
            return (
                <div className="absolute inset-0 overflow-hidden pointer-events-none animate-shake">
                    <div className="absolute inset-0 bg-yellow-900/20" />
                    <div className="absolute bottom-0 left-0 w-full h-1/3 border-t-2 border-yellow-800/20 transform -skew-y-3" />
                    <div className="absolute top-0 right-0 w-1/2 h-full border-l-2 border-yellow-800/20 transform skew-x-6" />
                </div>
            );

        case 'venenoso': 
            return (
                <div className="absolute inset-0 overflow-hidden pointer-events-none">
                    <div className="absolute inset-0 bg-fuchsia-950/30" />
                    {[...Array(10)].map((_, i) => (
                        <div 
                            key={i} 
                            className="absolute bottom-0 rounded-full border-2 border-fuchsia-500/40 bg-fuchsia-600/20 animate-bubble opacity-0"
                            style={{ 
                                width: `${10 + Math.random() * 30}px`, 
                                height: `${10 + Math.random() * 30}px`, 
                                left: `${Math.random() * 100}%`, 
                                animationDelay: `${Math.random() * 4}s`
                            }}
                        />
                    ))}
                </div>
            );

        case 'voador': 
            return (
                <div className="absolute inset-0 overflow-hidden pointer-events-none">
                    <div className="absolute inset-0 bg-sky-200/5" />
                    {[...Array(5)].map((_, i) => (
                        <div 
                            key={i} 
                            className="absolute h-1 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-wind opacity-0 rounded-full"
                            style={{ 
                                top: `${10 + Math.random() * 80}%`, 
                                width: `${100 + Math.random() * 200}px`,
                                animationDelay: `${Math.random() * 2}s`,
                                animationDuration: `${0.5 + Math.random() * 1}s`
                            }}
                        />
                    ))}
                    <div className="absolute top-10 left-10 text-sky-200/20 animate-drift-fast"><Cloud size={60} /></div>
                </div>
            );

        case 'fogo': 
            return (
                <div className="absolute inset-0 overflow-hidden pointer-events-none">
                    <div className="absolute bottom-0 left-0 right-0 h-40 bg-gradient-to-t from-red-900/40 to-transparent" />
                    {[...Array(10)].map((_, i) => (
                        <div 
                            key={i} 
                            className="absolute bottom-0 w-2 h-2 bg-orange-500 rounded-full animate-rise opacity-0" 
                            style={{ 
                                left: `${Math.random() * 100}%`, 
                                animationDelay: `${Math.random() * 2}s`,
                                animationDuration: `${2 + Math.random() * 2}s` 
                            }} 
                        />
                    ))}
                </div>
            );
        
        case 'agua': 
            return (
                <div className="absolute inset-0 overflow-hidden pointer-events-none">
                     <div className="absolute inset-0 bg-blue-900/20" />
                     {[...Array(6)].map((_, i) => (
                        <Droplets 
                            key={i}
                            className="absolute text-blue-400/30 animate-rise"
                            style={{
                                bottom: '0',
                                left: `${10 + Math.random() * 80}%`,
                                animationDelay: `${Math.random() * 3}s`
                            }}
                            size={24}
                        />
                     ))}
                </div>
            );

        case 'sombrio': 
            return (
                <div className="absolute inset-0 overflow-hidden pointer-events-none">
                    <div className="absolute inset-0 bg-gradient-to-b from-black via-neutral-900 to-purple-950/40" />
                    <div className="absolute top-10 right-10 w-24 h-24 rounded-full bg-indigo-100/5 shadow-[0_0_50px_rgba(200,200,255,0.05)] blur-sm" />
                    {[...Array(15)].map((_, i) => (
                        <div 
                            key={i} 
                            className="absolute w-1 h-1 bg-white rounded-full animate-twinkle" 
                            style={{ 
                                top: `${Math.random() * 100}%`, 
                                left: `${Math.random() * 100}%`, 
                                animationDelay: `${Math.random() * 3}s` 
                            }} 
                        />
                    ))}
                </div>
            );

        default:
            return <div className="absolute inset-0 bg-gradient-to-b from-neutral-800/20 to-transparent pointer-events-none" />;
    }
};

interface ScheduledBattle {
    gymType: string;
    opponent: string;
    date: string;
    time: string;
    role: 'Líder' | 'Desafiante';
    status: string;
}

const GymsPage: React.FC = () => {
    const { user, isAdmin } = useAuth();
    const [gyms, setGyms] = useState<Record<string, Gym>>({});
    const [selectedType, setSelectedType] = useState<string | null>(null);
    const [modalOpen, setModalOpen] = useState(false);
    const [leaderNick, setLeaderNick] = useState("");
    const [searchOpen, setSearchOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");
    const [searchResults, setSearchResults] = useState<{name: string, url: string}[]>([]);
    const [activeSlot, setActiveSlot] = useState<number | null>(null);
    const [isOffline, setIsOffline] = useState(false);
    const [onlinePlayers, setOnlinePlayers] = useState<string[]>([]);
    
    // Interest/Schedule Modal State
    const [showInterests, setShowInterests] = useState(false);
    const [showScheduleModal, setShowScheduleModal] = useState(false);
    const [schedulingNick, setSchedulingNick] = useState("");
    const [scheduleDate, setScheduleDate] = useState("");
    const [scheduleTime, setScheduleTime] = useState("");

    // My Battles Modal
    const [showMyBattles, setShowMyBattles] = useState(false);
    const [myBattles, setMyBattles] = useState<ScheduledBattle[]>([]);

    // Tabs
    const [activeTab, setActiveTab] = useState<'time' | 'historico'>('time');

    useEffect(() => {
        loadGyms();
        
        const fetchOnlinePlayers = async () => {
            try {
                const response = await fetch('https://api.mcsrvstat.us/2/jasper.lura.host:35570');
                const data = await response.json();
                if (data.players && data.players.list) {
                    setOnlinePlayers(data.players.list); // Array of strings (nicks)
                } else {
                    setOnlinePlayers([]);
                }
            } catch (e) {
                console.error("Failed to fetch online players", e);
            }
        };

        fetchOnlinePlayers();
        const interval = setInterval(fetchOnlinePlayers, 60000);
        return () => clearInterval(interval);
    }, []);

    const loadGyms = async () => {
        try {
            const data = await api.getGyms();
            setGyms(data);
            setIsOffline(false);
        } catch (error) {
            // Ignored as per user request to prevent "Failed to load gyms" error spam
        }
    };

    const handleOpenGym = (tipo: string) => {
        setSelectedType(tipo);
        const gym = gyms[tipo];
        const safeGym = gym || { tipo, lider: "", time: [null,null,null,null,null,null], liderSkin: undefined, challengers: [], activeBattle: null, history: [] };
        
        setLeaderNick(safeGym.lider || "");
        setActiveTab('time');
        setModalOpen(true);
        setShowInterests(false);
        setShowScheduleModal(false);
    };

    const handleSaveLeader = async () => {
        if (!selectedType) return;
        
        let targetNick = leaderNick;
        let targetSkin = user?.customSkin;

        if (!isAdmin) {
            if (!user) return alert("Faça login para assumir o ginásio.");
            targetNick = user.nick;
            targetSkin = user.customSkin;
        } else {
             if (!targetNick.trim()) return alert("Digite o nick do líder.");
             targetSkin = undefined;
        }
        
        if (!isAdmin) {
            const isAlreadyLeader = Object.values(gyms || {}).some((g: Gym) => 
                g && g.lider && g.lider.toLowerCase() === user?.nick.toLowerCase()
            );
            if (isAlreadyLeader) {
                return alert("Você já é líder de outro ginásio!");
            }
        }

        const currentGym = gyms[selectedType] || { tipo: selectedType, lider: "", time: [null,null,null,null,null,null] };

        try {
            await api.updateGym(selectedType, targetNick, currentGym.time, targetSkin);
            await loadGyms();
            setLeaderNick(targetNick);
        } catch (e: any) {
            alert(e.message);
        }
    };

    const handleLeaveGym = async (e: React.MouseEvent) => {
        e.stopPropagation();
        if (!selectedType) return;
        if (confirm("Tem certeza que deseja abandonar este ginásio?")) {
            try {
                await api.resetGym(selectedType);
                setLeaderNick("");
                await loadGyms();
            } catch (e: any) {
                alert(e.message);
            }
        }
    };

    const handleRemovePokemon = async (index: number) => {
        if (!selectedType) return;
        const currentGym = gyms[selectedType];
        if (!currentGym) return;

        const newTeam = [...currentGym.time];
        newTeam[index] = null;
        try {
            await api.updateGym(selectedType, currentGym.lider, newTeam, currentGym.liderSkin);
            await loadGyms();
        } catch (e: any) {
            alert(e.message);
        }
    };

    const handleSearchPokemon = async (query: string) => {
        setSearchQuery(query);
        const results = await api.searchPokemon(query);
        setSearchResults(results);
    };

    const handleSelectPokemon = async (url: string) => {
        if (!selectedType || activeSlot === null) return;
        const details = await api.getPokemonDetails(url);
        
        const currentGym = gyms[selectedType];
        if (!currentGym) return; 

        const newTeam = [...currentGym.time];
        newTeam[activeSlot] = details;
        
        try {
            await api.updateGym(selectedType, currentGym.lider, newTeam, currentGym.liderSkin);
            await loadGyms();
            setSearchOpen(false);
            setActiveSlot(null);
            setSearchQuery("");
        } catch (e: any) {
            alert(e.message);
        }
    };

    const handleToggleChallenge = async () => {
        if (!user || !selectedType) return alert("Você precisa estar logado.");
        try {
            await api.toggleGymChallenge(selectedType, user.nick);
            await loadGyms();
        } catch (e: any) {
            alert(e.message);
        }
    };

    // --- Scheduling & Battle Logic ---

    const openScheduleModal = (nick: string) => {
        setSchedulingNick(nick);
        setScheduleDate("");
        setScheduleTime("");
        setShowScheduleModal(true);
    };

    const confirmSchedule = async () => {
        if (!selectedType || !schedulingNick || !scheduleDate || !scheduleTime) return alert("Preencha data e hora.");
        try {
            await api.acceptChallenge(selectedType, schedulingNick, scheduleDate, scheduleTime);
            setShowScheduleModal(false);
            setShowInterests(false);
            await loadGyms();
        } catch (e: any) {
            alert(e.message);
        }
    };

    const resolveBattle = async (result: 'leader_win' | 'challenger_win') => {
        if (!selectedType) return;
        if (!confirm("Confirmar resultado da batalha? Esta ação não pode ser desfeita.")) return;
        try {
            await api.resolveBattle(selectedType, result);
            await loadGyms();
        } catch (e: any) {
            alert(e.message);
        }
    };

    const handleOpenMyBattles = () => {
        if (!user) return alert("Faça login para ver seus confrontos.");
        
        const battles: ScheduledBattle[] = [];
        
        Object.values(gyms).forEach((gym: Gym) => {
            if (gym.activeBattle && gym.activeBattle.status === 'scheduled') {
                // Case 1: User is the Leader
                if (gym.lider && gym.lider.toLowerCase() === user.nick.toLowerCase()) {
                    battles.push({
                        gymType: gym.tipo,
                        opponent: gym.activeBattle.challengerNick,
                        date: gym.activeBattle.date,
                        time: gym.activeBattle.time,
                        role: 'Líder',
                        status: 'active'
                    });
                }
                // Case 2: User is the Challenger
                else if (gym.activeBattle.challengerNick.toLowerCase() === user.nick.toLowerCase()) {
                    battles.push({
                        gymType: gym.tipo,
                        opponent: gym.lider,
                        date: gym.activeBattle.date,
                        time: gym.activeBattle.time,
                        role: 'Desafiante',
                        status: 'active'
                    });
                }
            }
        });

        setMyBattles(battles);
        setShowMyBattles(true);
    };

    // Safe fallback for render
    const currentGym = selectedType ? (gyms[selectedType] || { tipo: selectedType, lider: "", time: [null,null,null,null,null,null], challengers: [], activeBattle: null, history: [] }) : null;
    const isManaged = currentGym && currentGym.lider !== "";
    const isLeader = user && currentGym && currentGym.lider.toLowerCase() === user.nick.toLowerCase();
    const canEdit = currentGym && (isAdmin || isLeader);
    const canClaim = user && !isManaged;
    const isChallenger = user && currentGym?.challengers?.includes(user.nick);

    return (
        <div className="w-full max-w-6xl mx-auto flex flex-col items-center">
            
            {isOffline && (
                <div className="w-full max-w-4xl mb-6 bg-red-900/30 border border-red-500/50 p-4 flex items-center gap-3 rounded-sm animate-pulse">
                    <WifiOff className="text-red-500" size={24} />
                    <div>
                        <h3 className="text-red-400 font-pixel text-xs uppercase">Erro de Conexão</h3>
                        <p className="text-red-200/70 text-xs font-sans">Não foi possível conectar ao servidor. Verifique se o backend está rodando.</p>
                    </div>
                </div>
            )}

            <div className="bg-card w-full max-w-4xl p-8 md:p-12 border border-neutral-800 shadow-2xl backdrop-blur-md rounded-sm">
                <h1 className="font-pixel text-crimson text-xl md:text-2xl mb-4 text-center">Líderes de Ginásio</h1>
                <p className="text-gray-400 text-sm mb-10 text-center font-sans">
                    {user ? "Clique em uma insígnia para ver ou gerenciar!" : "Faça Login para gerenciar ginásios."}
                </p>

                <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-8 justify-items-center mb-10">
                    {GYM_TYPES.map((tipo) => {
                        const gym = gyms[tipo];
                        const leaderNick = gym?.lider || "";
                        const isOnline = leaderNick && onlinePlayers.some(p => p.toLowerCase() === leaderNick.toLowerCase());

                        return (
                            <div 
                                key={tipo}
                                onClick={() => handleOpenGym(tipo)}
                                className="group cursor-pointer flex flex-col items-center gap-2 transition-transform hover:scale-110"
                            >
                                {/* 
                                    Circular Gym Icon with explicit shadow border for Online status.
                                    REMOVED animate-pulse-glow which was causing image blur.
                                    Replaced with explicit box-shadow logic that applies strictly to the container border.
                                */}
                                <div 
                                    className={`
                                        w-20 h-20 rounded-full flex items-center justify-center border-4 transition-all overflow-hidden relative
                                        ${isOnline 
                                            ? 'border-green-500 shadow-[0_0_15px_rgba(34,197,94,0.8)]' // Stronger shadow, NO opacity animation on container
                                            : 'border-neutral-800 shadow-lg group-hover:border-white'
                                        }
                                    `}
                                    style={{ backgroundColor: TYPE_COLORS[tipo] || '#333' }}
                                >
                                    <img 
                                        src={getTypeIcon(tipo)} 
                                        alt={tipo}
                                        className="w-12 h-12 object-contain brightness-0 invert opacity-90 drop-shadow-sm"
                                        style={{ filter: 'none' }} // Force no filter on image
                                    />
                                </div>
                                <div className="flex flex-col items-center">
                                    <span className="text-xs text-gray-500 font-pixel uppercase group-hover:text-crimson transition-colors">
                                        {tipo}
                                    </span>
                                    {isOnline && (
                                        <span className="text-[8px] text-green-400 font-sans font-bold tracking-wider mt-1 drop-shadow-[0_0_5px_rgba(34,197,94,0.5)]">ONLINE</span>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>

                {user && (
                    <div className="flex justify-center border-t border-neutral-800 pt-8">
                        <button 
                            onClick={handleOpenMyBattles}
                            className="flex items-center gap-2 bg-neutral-900 border border-crimson text-white px-6 py-3 hover:bg-crimson transition-colors shadow-lg font-pixel text-xs uppercase tracking-wider"
                        >
                            <Swords size={16} /> Meus Confrontos
                        </button>
                    </div>
                )}
            </div>

            {/* Modals */}
            {modalOpen && currentGym && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-sm p-4">
                    <div className="bg-neutral-900 border border-neutral-700 w-full max-w-2xl p-0 relative shadow-[0_0_40px_rgba(220,20,60,0.1)] overflow-hidden flex flex-col">
                        
                        <GymBackgroundEffect type={currentGym.tipo} />

                        <div className="relative z-20 flex border-b border-neutral-800 bg-neutral-950/80">
                            <button 
                                onClick={() => setActiveTab('time')}
                                className={`flex-1 py-4 font-pixel text-xs uppercase transition-colors ${activeTab === 'time' ? 'text-white bg-white/10 border-b-2 border-crimson' : 'text-gray-500 hover:text-gray-300'}`}
                            >
                                Time
                            </button>
                            <button 
                                onClick={() => setActiveTab('historico')}
                                className={`flex-1 py-4 font-pixel text-xs uppercase transition-colors ${activeTab === 'historico' ? 'text-white bg-white/10 border-b-2 border-crimson' : 'text-gray-500 hover:text-gray-300'}`}
                            >
                                Histórico
                            </button>
                            <button onClick={() => setModalOpen(false)} className="absolute top-0 right-0 p-4 text-gray-500 hover:text-white transition-colors"><X size={24} /></button>
                        </div>

                        <div className="relative z-10 p-8 max-h-[75vh] overflow-y-auto custom-scrollbar">
                            
                            <div className="flex items-center justify-center gap-3 mb-8">
                                <div className="w-10 h-10 rounded-full flex items-center justify-center border-2 border-white bg-black/50 backdrop-blur-sm">
                                    <img src={getTypeIcon(currentGym.tipo)} alt={currentGym.tipo} className="w-6 h-6 object-contain brightness-0 invert" />
                                </div>
                                <h2 className="font-pixel text-crimson text-xl text-center uppercase drop-shadow-md">Ginásio de {currentGym.tipo}</h2>
                            </div>

                            {activeTab === 'time' && (
                                <>
                                    {/* --- Leader & Management Section (Restored Unique Styling) --- */}
                                    <div className="flex gap-6 mb-8 border-b border-neutral-800/50 pb-8">
                                        <div className="flex-shrink-0 relative">
                                            <div className="absolute -inset-1 bg-crimson blur opacity-20"></div>
                                            <img 
                                                src={leaderNick ? getSkinUrl(leaderNick, currentGym.liderSkin) : 'https://placehold.co/100x100/333/666?text=?'} 
                                                alt="Skin" 
                                                className="w-32 h-32 border-2 border-neutral-600 bg-neutral-900 relative z-10 image-pixelated" 
                                            />
                                        </div>

                                        <div className="flex-grow flex flex-col justify-between">
                                            {!isManaged ? (
                                                <div className="flex flex-col gap-4 h-full justify-center">
                                                    {canClaim ? (
                                                        <>
                                                            {isAdmin && <input type="text" value={leaderNick} onChange={(e) => setLeaderNick(e.target.value)} placeholder="Nick do Líder" className="bg-black/50 border-b-2 border-crimson text-white font-pixel text-sm p-3 w-full focus:outline-none focus:border-white transition-colors" />}
                                                            <button onClick={handleSaveLeader} className="bg-crimson text-white font-bold py-3 px-6 uppercase text-sm tracking-wider hover:bg-red-700 transition-colors w-full shadow-lg font-pixel">{isAdmin ? "Definir Líder" : "Assumir Ginásio"}</button>
                                                        </>
                                                    ) : (
                                                        <p className="text-gray-500 font-pixel text-xs text-center bg-black/40 p-2 rounded">Faça Login para assumir.</p>
                                                    )}
                                                </div>
                                            ) : (
                                                <div className="flex flex-col h-full gap-2">
                                                    <div>
                                                        <h3 className="font-pixel text-white text-2xl drop-shadow-md tracking-wide mb-1">{currentGym.lider}</h3>
                                                        {isLeader && (
                                                            <span className="inline-block bg-green-900/40 text-green-400 border border-green-800 text-[9px] font-pixel px-2 py-1 rounded">
                                                                VOCÊ É O LÍDER
                                                            </span>
                                                        )}
                                                    </div>
                                                    
                                                    <div className="mt-auto flex flex-wrap gap-2">
                                                        {canEdit && (
                                                            <button 
                                                                onClick={(e) => handleLeaveGym(e)} 
                                                                className="border border-neutral-600 bg-transparent text-neutral-400 text-[10px] px-3 py-2 font-sans hover:text-crimson hover:border-crimson transition-all uppercase tracking-widest"
                                                            >
                                                                Sair do Ginásio
                                                            </button>
                                                        )}
                                                        
                                                        {isLeader ? (
                                                            <button 
                                                                onClick={() => setShowInterests(true)}
                                                                className="bg-indigo-600 text-white font-pixel text-[10px] px-4 py-2 hover:bg-indigo-500 transition-colors flex items-center gap-2 shadow-lg uppercase"
                                                            >
                                                                <Users size={12} /> Interessados ({currentGym.challengers?.length || 0})
                                                            </button>
                                                        ) : user && (
                                                            <button 
                                                                onClick={handleToggleChallenge}
                                                                className={`${isChallenger ? 'bg-yellow-600 hover:bg-yellow-500' : 'bg-crimson hover:bg-red-600'} text-white font-pixel text-[10px] px-4 py-2 transition-colors flex items-center gap-2 shadow-lg uppercase`}
                                                            >
                                                                <Swords size={12} /> {isChallenger ? "Cancelar Desafio" : "Quero Desafiar"}
                                                            </button>
                                                        )}
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    {/* --- Pokemon Team --- */}
                                    <div className="w-full mb-8">
                                        <h4 className="text-gray-500 text-[10px] text-center uppercase tracking-[0.2em] mb-4 font-sans font-bold">Time Pokémon</h4>
                                        <div className="grid grid-cols-3 md:grid-cols-6 gap-3">
                                            {currentGym.time.map((poke, idx) => (
                                                <div key={idx} onClick={() => { if (!canEdit) return; setActiveSlot(idx); setSearchOpen(true); }} className={`relative aspect-square bg-[#111] border border-neutral-800 flex flex-col items-center justify-center p-1 shadow-inner ${canEdit ? 'cursor-pointer hover:border-crimson hover:bg-neutral-900' : 'opacity-80 cursor-not-allowed'}`}>
                                                    {poke ? (<><button onClick={(e) => { e.stopPropagation(); handleRemovePokemon(idx); }} className={`absolute top-1 right-1 text-gray-600 hover:text-crimson z-10 ${!canEdit && 'hidden'}`}><X size={10} /></button><img src={poke.sprite} alt={poke.name} className="w-full h-full object-contain image-pixelated" /><div className="absolute bottom-0 w-full bg-black/60 text-[7px] text-gray-300 font-pixel text-center py-0.5 truncate">{poke.name}</div></>) : (<span className="text-2xl text-neutral-800 font-bold select-none">+</span>)}
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    {/* --- Active Battle Card (Moved to Bottom) --- */}
                                    {currentGym.activeBattle && (
                                        <div className="bg-neutral-950 border-2 border-indigo-900/50 p-0 rounded relative overflow-hidden mt-4">
                                            <div className="bg-indigo-900/20 p-2 border-b border-indigo-900/30 flex justify-between items-center">
                                                <h4 className="font-pixel text-indigo-400 text-[10px] uppercase tracking-widest flex items-center gap-2">
                                                    <Swords size={12} /> Batalha Agendada
                                                </h4>
                                                <div className="flex items-center gap-3 text-[9px] font-sans text-indigo-200">
                                                    <span className="flex items-center gap-1"><Calendar size={10}/> {currentGym.activeBattle.date}</span>
                                                    <span className="flex items-center gap-1"><Clock size={10}/> {currentGym.activeBattle.time}</span>
                                                </div>
                                            </div>
                                            
                                            <div className="p-6 flex items-center justify-center gap-4 md:gap-12 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')]">
                                                {/* Leader Side */}
                                                <div className="text-center relative group">
                                                    <div className="absolute -inset-2 bg-green-500/20 blur rounded-full opacity-0 group-hover:opacity-100 transition-opacity"></div>
                                                    <img src={getSkinUrl(currentGym.lider, currentGym.liderSkin, 64)} className="w-16 h-16 border-2 border-green-600 image-pixelated relative z-10" />
                                                    <span className="text-green-400 font-pixel text-[10px] block mt-2">{currentGym.lider}</span>
                                                </div>
                                                
                                                <div className="flex flex-col items-center relative">
                                                    <span className="font-pixel text-4xl text-white drop-shadow-[0_0_10px_rgba(255,255,255,0.5)] italic transform -skew-x-12">VS</span>
                                                </div>

                                                {/* Challenger Side */}
                                                <div className="text-center relative group">
                                                    <div className="absolute -inset-2 bg-red-500/20 blur rounded-full opacity-0 group-hover:opacity-100 transition-opacity"></div>
                                                    <img src={getSkinUrl(currentGym.activeBattle.challengerNick, undefined, 64)} className="w-16 h-16 border-2 border-red-600 image-pixelated relative z-10" />
                                                    <span className="text-red-400 font-pixel text-[10px] block mt-2">{currentGym.activeBattle.challengerNick}</span>
                                                </div>
                                            </div>

                                            {canEdit && (
                                                <div className="grid grid-cols-2 border-t border-indigo-900/30 divide-x divide-indigo-900/30">
                                                    <button 
                                                        onClick={() => resolveBattle('leader_win')} 
                                                        className="bg-green-900/20 hover:bg-green-900/50 text-green-400 text-[9px] font-pixel py-3 uppercase transition-colors"
                                                    >
                                                        Vencedor: {currentGym.lider}
                                                    </button>
                                                    <button 
                                                        onClick={() => resolveBattle('challenger_win')} 
                                                        className="bg-red-900/20 hover:bg-red-900/50 text-red-400 text-[9px] font-pixel py-3 uppercase transition-colors"
                                                    >
                                                        Vencedor: {currentGym.activeBattle.challengerNick}
                                                    </button>
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </>
                            )}

                            {activeTab === 'historico' && (
                                <div className="w-full">
                                    {!currentGym.history || currentGym.history.length === 0 ? (
                                        <div className="text-center text-gray-500 font-pixel text-xs py-10 flex flex-col items-center gap-2">
                                            <History size={32} className="opacity-20"/>
                                            Nenhum histórico de batalhas.
                                        </div>
                                    ) : (
                                        <div className="flex flex-col gap-3">
                                            {currentGym.history.map(battle => (
                                                <div key={battle.id} className="bg-black/40 border border-neutral-800 p-3 flex items-center justify-between group hover:border-neutral-600 transition-colors">
                                                    <div className="flex items-center gap-4">
                                                        <div className={`flex items-center gap-2 ${battle.result === 'leader_win' ? 'opacity-100' : 'opacity-50 grayscale'}`}>
                                                            <img src={getSkinUrl(currentGym.lider, currentGym.liderSkin, 32)} className="w-8 h-8 border border-neutral-700 image-pixelated" />
                                                            {battle.result === 'leader_win' && <Crown size={12} className="text-yellow-500" />}
                                                        </div>
                                                        <span className="font-pixel text-[10px] text-gray-600">VS</span>
                                                        <div className={`flex items-center gap-2 ${battle.result === 'challenger_win' ? 'opacity-100' : 'opacity-50 grayscale'}`}>
                                                            <img src={getSkinUrl(battle.challengerNick, undefined, 32)} className="w-8 h-8 border border-neutral-700 image-pixelated" />
                                                            {battle.result === 'challenger_win' && <Crown size={12} className="text-yellow-500" />}
                                                        </div>
                                                    </div>
                                                    
                                                    <div className="text-right">
                                                        <span className={`font-pixel text-[9px] uppercase block mb-1 ${battle.result === 'leader_win' ? 'text-green-500' : 'text-red-500'}`}>
                                                            {battle.result === 'leader_win' ? 'Vitória do Líder' : 'Vitória do Desafiante'}
                                                        </span>
                                                        <span className="text-[9px] text-gray-600 font-sans block">{battle.date}</span>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* Interest List Modal */}
            {showInterests && !showScheduleModal && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/95 backdrop-blur-md p-4">
                    <div className="bg-neutral-900 border border-neutral-700 w-full max-w-md p-6 shadow-2xl relative">
                        <button onClick={() => setShowInterests(false)} className="absolute top-4 right-4 text-gray-500 hover:text-white"><X size={20} /></button>
                        <h3 className="font-pixel text-white text-sm mb-6 text-center uppercase border-b border-neutral-800 pb-4">Desafiantes Interessados</h3>
                        
                        <div className="max-h-80 overflow-y-auto custom-scrollbar space-y-2">
                            {(!currentGym?.challengers || currentGym.challengers.length === 0) ? (
                                <p className="text-center text-gray-500 text-xs py-8">Nenhum desafiante no momento.</p>
                            ) : (
                                currentGym.challengers.map(nick => (
                                    <div key={nick} className="flex items-center gap-4 bg-black/40 p-3 border border-neutral-800">
                                        <img src={getSkinUrl(nick, undefined, 40)} alt={nick} className="w-10 h-10 image-pixelated border border-neutral-700" />
                                        <div className="flex flex-col">
                                            <span className="text-white font-pixel text-xs">{nick}</span>
                                            <span className="text-[9px] text-gray-500 font-sans">Aguardando</span>
                                        </div>
                                        <button 
                                            onClick={() => openScheduleModal(nick)}
                                            className="ml-auto bg-green-700 text-white px-3 py-1 rounded text-[9px] font-pixel hover:bg-green-600 transition-colors"
                                        >
                                            ACEITAR
                                        </button>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* Schedule Modal */}
            {showScheduleModal && (
                <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/95 backdrop-blur-md p-4">
                    <div className="bg-neutral-900 border-2 border-indigo-500 w-full max-w-sm p-6 shadow-2xl relative">
                        <button onClick={() => setShowScheduleModal(false)} className="absolute top-4 right-4 text-gray-500 hover:text-white"><X size={20} /></button>
                        <h3 className="font-pixel text-white text-sm mb-2 text-center uppercase">Agendar Batalha</h3>
                        <p className="text-center text-gray-400 text-xs mb-6 font-sans">Defina o horário para o confronto contra <span className="text-white font-bold">{schedulingNick}</span></p>
                        
                        <div className="space-y-4">
                            <div>
                                <label className="text-[10px] text-gray-500 font-pixel uppercase block mb-1">Data</label>
                                <input type="date" value={scheduleDate} onChange={e => setScheduleDate(e.target.value)} className="w-full bg-black border border-neutral-700 text-white p-2 text-sm font-sans focus:border-indigo-500 outline-none" />
                            </div>
                            <div>
                                <label className="text-[10px] text-gray-500 font-pixel uppercase block mb-1">Horário</label>
                                <input type="time" value={scheduleTime} onChange={e => setScheduleTime(e.target.value)} className="w-full bg-black border border-neutral-700 text-white p-2 text-sm font-sans focus:border-indigo-500 outline-none" />
                            </div>
                            <button onClick={confirmSchedule} className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-pixel text-xs py-3 mt-2">CONFIRMAR AGENDAMENTO</button>
                        </div>
                    </div>
                </div>
            )}

            {/* My Battles Modal */}
            {showMyBattles && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/95 backdrop-blur-md p-4">
                    <div className="bg-neutral-900 border border-neutral-700 w-full max-w-2xl p-6 shadow-2xl relative flex flex-col max-h-[80vh]">
                        <button onClick={() => setShowMyBattles(false)} className="absolute top-4 right-4 text-gray-500 hover:text-white"><X size={20} /></button>
                        <h3 className="font-pixel text-white text-sm mb-6 text-center uppercase border-b border-neutral-800 pb-4 flex items-center justify-center gap-2">
                            <Swords size={16} className="text-crimson"/> Meus Confrontos Agendados
                        </h3>
                        
                        <div className="overflow-y-auto custom-scrollbar space-y-3 flex-grow">
                            {myBattles.length === 0 ? (
                                <div className="text-center text-gray-500 text-xs py-12 flex flex-col items-center gap-3">
                                    <Swords size={32} className="opacity-20"/>
                                    Você não tem batalhas agendadas.
                                </div>
                            ) : (
                                myBattles.map((battle, idx) => (
                                    <div key={idx} className="bg-black/40 border border-neutral-800 p-4 flex flex-col md:flex-row items-center gap-4 group hover:border-neutral-600 transition-colors">
                                        <div className="flex items-center gap-4 w-full md:w-1/3">
                                            <div className="w-10 h-10 rounded-full flex items-center justify-center border border-neutral-700 bg-neutral-900">
                                                <img src={getTypeIcon(battle.gymType)} className="w-6 h-6 brightness-0 invert" />
                                            </div>
                                            <div className="flex flex-col">
                                                <span className="text-crimson font-pixel text-[10px] uppercase">Ginásio {battle.gymType}</span>
                                                <span className="text-white font-bold text-xs font-sans">{battle.role}</span>
                                            </div>
                                        </div>

                                        <div className="flex-1 flex flex-col items-center text-center">
                                            <span className="text-[9px] text-gray-500 uppercase tracking-widest mb-1">Contra</span>
                                            <div className="flex items-center gap-2">
                                                <User size={14} className="text-gray-400"/>
                                                <span className="text-white font-pixel text-sm">{battle.opponent}</span>
                                            </div>
                                        </div>

                                        <div className="flex flex-col items-end gap-1 w-full md:w-1/3 text-right">
                                            <div className="flex items-center gap-2 text-indigo-300 text-xs font-sans bg-indigo-900/20 px-2 py-1 rounded">
                                                <Calendar size={12} /> {battle.date}
                                            </div>
                                            <div className="flex items-center gap-2 text-gray-400 text-xs font-sans">
                                                <Clock size={12} /> {battle.time}
                                            </div>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* Pokemon Search Modal (Keep existing) */}
            {searchOpen && (
                <div className="fixed inset-0 z-[80] flex items-center justify-center bg-black/95 backdrop-blur-md p-4">
                    <div className="bg-neutral-900 border border-neutral-700 w-full max-w-md p-6 shadow-2xl">
                        <h3 className="font-pixel text-white text-sm mb-4 text-center">Escolha o Pokémon</h3>
                        <div className="relative mb-4">
                            <input autoFocus type="text" value={searchQuery} onChange={(e) => handleSearchPokemon(e.target.value)} placeholder="Digite o nome..." className="w-full bg-neutral-800 border-none text-white p-3 pl-10 font-pixel text-xs focus:ring-2 focus:ring-crimson outline-none" />
                            <Search className="absolute left-3 top-3 text-gray-500" size={16} />
                        </div>
                        <div className="h-64 overflow-y-auto border border-neutral-800 bg-black/50 mb-4 custom-scrollbar">
                            {searchResults.length === 0 ? <div className="p-4 text-gray-600 text-xs font-pixel text-center">{searchQuery ? "Nenhum resultado" : "Comece a digitar..."}</div> : searchResults.map(p => <div key={p.name} onClick={() => handleSelectPokemon(p.url)} className="p-3 border-b border-neutral-800 text-gray-300 font-pixel text-xs hover:bg-crimson hover:text-white cursor-pointer uppercase transition-colors">{p.name}</div>)}
                        </div>
                        <button onClick={() => setSearchOpen(false)} className="w-full py-3 border border-neutral-700 text-gray-500 font-pixel text-xs hover:text-white hover:border-white transition-colors">Cancelar</button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default GymsPage;
