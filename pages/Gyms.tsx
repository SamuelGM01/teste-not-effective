
import React, { useEffect, useState } from 'react';
import { GYM_TYPES, Gym, TYPE_COLORS, getTypeIcon, getSkinUrl } from '../types';
import * as api from '../services/mockBackend';
import { useAuth } from '../contexts/AuthContext';
import { X, Search, Lock, Zap, Ghost, Snowflake, Bug, HandMetal, Settings, Wind, Cloud, Droplets, Leaf, Eye, Sparkles, Hexagon, Circle, Triangle } from 'lucide-react';

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
                    <div 
                        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[200%] h-[200%] opacity-10"
                        style={{
                            background: 'repeating-conic-gradient(from 0deg, #fff 0deg 5deg, transparent 5deg 15deg)',
                            animation: 'spin 10s linear infinite'
                        }}
                    />
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full animate-flash opacity-20">
                         <div className="w-full h-full bg-orange-500/20 blur-xl rounded-full" />
                    </div>
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 animate-punch">
                        <svg width="200" height="200" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-orange-600 drop-shadow-[0_0_15px_rgba(234,88,12,0.8)]">
                            <path d="M7 11V7C7 5.34315 8.34315 4 10 4H10.5C11.8807 4 13 5.11929 13 6.5V11M11 11V7.5C11 6.11929 12.1193 5 13.5 5H14C15.3807 5 16.5 6.11929 16.5 7.5V11M14.5 11V9.5C14.5 8.11929 15.6193 7 17 7H17.5C18.8807 7 20 8.11929 20 9.5V14C20 18.4183 16.4183 22 12 22H11C7.68629 22 5 19.3137 5 16V14.5C5 12.567 6.567 11 8.5 11H14.5Z" fill="currentColor" />
                        </svg>
                    </div>
                    {[...Array(3)].map((_, i) => (
                        <div 
                            key={i}
                            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full border-4 border-orange-500/60 animate-shockwave"
                            style={{
                                animationDelay: `${i * 0.8}s`
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

const Gyms: React.FC = () => {
    const { user, isAdmin } = useAuth();
    const [gyms, setGyms] = useState<Record<string, Gym>>({});
    const [selectedType, setSelectedType] = useState<string | null>(null);
    const [modalOpen, setModalOpen] = useState(false);
    const [leaderNick, setLeaderNick] = useState("");
    const [searchOpen, setSearchOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");
    const [searchResults, setSearchResults] = useState<{name: string, url: string}[]>([]);
    const [activeSlot, setActiveSlot] = useState<number | null>(null);

    useEffect(() => {
        loadGyms();
    }, []);

    const loadGyms = async () => {
        const data = await api.getGyms();
        setGyms(data);
    };

    const handleOpenGym = (tipo: string) => {
        setSelectedType(tipo);
        const gym = gyms[tipo];
        setLeaderNick(gym.lider || "");
        setModalOpen(true);
    };

    const handleSaveLeader = async () => {
        if (!selectedType) return;
        
        let targetNick = leaderNick;
        // User's custom skin if available, otherwise undefined (backend handles it if undefined/admin mode)
        let targetSkin = user?.customSkin;

        if (!isAdmin) {
            if (!user) return alert("Faça login para assumir o ginásio.");
            targetNick = user.nick;
            targetSkin = user.customSkin;
        } else {
             if (!targetNick.trim()) return alert("Digite o nick do líder.");
             // Admin assigning manually: we don't have a custom skin upload here, so it stays undefined or previous
             // Ideally admin would also be able to set skin, but for now we assume manual entry uses default skin logic
             targetSkin = undefined;
        }
        
        if (!isAdmin) {
            const isAlreadyLeader = Object.values(gyms).some((g: Gym) => g.lider.toLowerCase() === user?.nick.toLowerCase());
            if (isAlreadyLeader) {
                return alert("Você já é líder de outro ginásio!");
            }
        }

        const currentGym = gyms[selectedType];
        await api.updateGym(selectedType, targetNick, currentGym.time, targetSkin);
        await loadGyms();
        setLeaderNick(targetNick);
    };

    const handleLeaveGym = async (e: React.MouseEvent) => {
        e.stopPropagation();
        if (!selectedType) return;
        if (confirm("Tem certeza que deseja abandonar este ginásio?")) {
            await api.resetGym(selectedType);
            setLeaderNick("");
            await loadGyms();
        }
    };

    const handleRemovePokemon = async (index: number) => {
        if (!selectedType) return;
        const currentGym = gyms[selectedType];
        const newTeam = [...currentGym.time];
        newTeam[index] = null;
        await api.updateGym(selectedType, currentGym.lider, newTeam, currentGym.liderSkin);
        await loadGyms();
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
        const newTeam = [...currentGym.time];
        newTeam[activeSlot] = details;
        
        await api.updateGym(selectedType, currentGym.lider, newTeam, currentGym.liderSkin);
        await loadGyms();
        setSearchOpen(false);
        setActiveSlot(null);
        setSearchQuery("");
    };

    const currentGym = selectedType ? gyms[selectedType] : null;
    const isManaged = currentGym && currentGym.lider !== "";
    const canEdit = currentGym && user && (isAdmin || currentGym.lider.toLowerCase() === user.nick.toLowerCase());
    const canClaim = user && !isManaged;

    return (
        <div className="w-full max-w-6xl mx-auto flex flex-col items-center">
            <div className="bg-card w-full max-w-4xl p-8 md:p-12 border border-neutral-800 shadow-2xl backdrop-blur-md rounded-sm">
                <h1 className="font-pixel text-crimson text-xl md:text-2xl mb-4 text-center">Líderes de Ginásio</h1>
                <p className="text-gray-400 text-sm mb-10 text-center font-sans">
                    {user ? "Clique em uma insígnia para ver ou gerenciar!" : "Faça Login para gerenciar ginásios."}
                </p>

                <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-8 justify-items-center">
                    {GYM_TYPES.map((tipo) => (
                        <div 
                            key={tipo}
                            onClick={() => handleOpenGym(tipo)}
                            className="group cursor-pointer flex flex-col items-center gap-2 transition-transform hover:scale-110"
                        >
                            <div 
                                className="w-20 h-20 rounded-full flex items-center justify-center border-4 border-neutral-800 group-hover:border-white transition-all shadow-lg overflow-hidden relative"
                                style={{ backgroundColor: TYPE_COLORS[tipo] || '#333' }}
                            >
                                <img 
                                    src={getTypeIcon(tipo)} 
                                    alt={tipo}
                                    className="w-12 h-12 object-contain brightness-0 invert opacity-90 drop-shadow-sm"
                                />
                            </div>
                            <span className="text-xs text-gray-500 font-pixel uppercase group-hover:text-crimson transition-colors">
                                {tipo}
                            </span>
                        </div>
                    ))}
                </div>
            </div>

            {modalOpen && currentGym && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-sm p-4">
                    <div className="bg-neutral-900 border border-neutral-700 w-full max-w-2xl p-8 relative shadow-[0_0_40px_rgba(220,20,60,0.1)] overflow-hidden">
                        
                        <GymBackgroundEffect type={currentGym.tipo} />

                        <div className="relative z-10">
                            <button 
                                onClick={() => setModalOpen(false)}
                                className="absolute top-0 right-0 text-gray-500 hover:text-white transition-colors z-20"
                            >
                                <X size={32} />
                            </button>

                            <div className="flex items-center justify-center gap-3 mb-8">
                                <div 
                                    className="w-10 h-10 rounded-full flex items-center justify-center border-2 border-white bg-black/50 backdrop-blur-sm"
                                >
                                    <img 
                                        src={getTypeIcon(currentGym.tipo)} 
                                        alt={currentGym.tipo}
                                        className="w-6 h-6 object-contain brightness-0 invert"
                                    />
                                </div>
                                <h2 className="font-pixel text-crimson text-xl text-center uppercase drop-shadow-md">
                                    Ginásio de {currentGym.tipo}
                                </h2>
                            </div>

                            <div className="flex flex-col md:flex-row gap-8 items-center md:items-start justify-center mb-8 border-b border-neutral-800/50 pb-8">
                                <div className="flex-shrink-0">
                                    <img 
                                        src={leaderNick ? getSkinUrl(leaderNick, currentGym.liderSkin) : 'https://placehold.co/100x100/333/666?text=?'} 
                                        alt="Skin"
                                        className="w-32 h-32 border-2 border-neutral-700 image-pixelated bg-neutral-800/80 shadow-lg" 
                                    />
                                </div>

                                <div className="flex-grow flex flex-col justify-center items-center md:items-start w-full">
                                    {!isManaged ? (
                                        <div className="w-full flex flex-col items-center md:items-start gap-4">
                                            {canClaim ? (
                                                <>
                                                    {isAdmin && (
                                                        <input 
                                                            type="text" 
                                                            value={leaderNick}
                                                            onChange={(e) => setLeaderNick(e.target.value)}
                                                            placeholder="Nick do Líder"
                                                            className="bg-black/50 border-b-2 border-crimson text-white font-pixel text-sm p-3 text-center md:text-left w-full max-w-xs focus:outline-none focus:border-white transition-colors placeholder-gray-600 opacity-90 backdrop-blur-sm"
                                                        />
                                                    )}
                                                    <button 
                                                        onClick={handleSaveLeader}
                                                        className="bg-crimson text-white font-bold py-3 px-6 uppercase text-sm tracking-wider hover:bg-red-700 transition-colors w-full max-w-xs shadow-lg"
                                                    >
                                                        {isAdmin ? "Definir Líder" : "Assumir Ginásio"}
                                                    </button>
                                                </>
                                            ) : (
                                                <p className="text-gray-500 font-pixel text-xs text-center bg-black/40 p-2 rounded">Faça Login para assumir.</p>
                                            )}
                                        </div>
                                    ) : (
                                        <div className="w-full flex flex-col items-center md:items-start gap-4">
                                            <h3 className="font-pixel text-white text-lg drop-shadow-md">{currentGym.lider}</h3>
                                            {canEdit && (
                                                <button 
                                                    onClick={(e) => handleLeaveGym(e)}
                                                    className="border border-neutral-700 bg-black/40 text-gray-400 py-2 px-4 text-xs font-sans hover:text-crimson hover:border-crimson transition-colors uppercase tracking-widest backdrop-blur-sm"
                                                >
                                                    Sair do Ginásio
                                                </button>
                                            )}
                                            {!canEdit && (
                                                <span className="flex items-center gap-2 text-neutral-400 text-xs uppercase font-bold border border-neutral-800/50 bg-black/40 px-3 py-1 rounded-full backdrop-blur-sm">
                                                    <Lock size={12}/> Somente o Líder pode editar
                                                </span>
                                            )}
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className="w-full">
                                <h4 className="text-gray-400 text-xs text-center uppercase tracking-widest mb-4 font-bold drop-shadow-sm">Time Pokémon</h4>
                                <div className="grid grid-cols-3 md:grid-cols-6 gap-3">
                                    {currentGym.time.map((poke, idx) => (
                                        <div 
                                            key={idx}
                                            onClick={() => {
                                                if (!canEdit) return;
                                                setActiveSlot(idx);
                                                setSearchOpen(true);
                                            }}
                                            className={`
                                                relative h-24 bg-[#1a1a1a]/90 backdrop-blur-sm border border-neutral-800 flex flex-col items-center justify-center p-2 shadow-lg
                                                ${canEdit ? 'cursor-pointer hover:border-crimson hover:bg-neutral-800' : 'opacity-80 cursor-not-allowed'}
                                            `}
                                        >
                                            {poke ? (
                                                <>
                                                    {canEdit && (
                                                        <button 
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                handleRemovePokemon(idx);
                                                            }}
                                                            className="absolute top-1 right-1 text-gray-600 hover:text-crimson z-10"
                                                        >
                                                            <X size={12} />
                                                        </button>
                                                    )}
                                                    <img src={poke.sprite} alt={poke.name} className="w-16 h-16 object-contain image-pixelated drop-shadow-md" />
                                                    <span className="text-[9px] text-gray-300 font-pixel mt-1 truncate w-full text-center">{poke.name}</span>
                                                </>
                                            ) : (
                                                <span className="text-3xl text-neutral-700 font-bold select-none">+</span>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {searchOpen && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/95 backdrop-blur-md p-4">
                    <div className="bg-neutral-900 border border-neutral-700 w-full max-w-md p-6 shadow-2xl">
                        <h3 className="font-pixel text-white text-sm mb-4 text-center">Escolha o Pokémon</h3>
                        <div className="relative mb-4">
                            <input 
                                autoFocus
                                type="text" 
                                value={searchQuery}
                                onChange={(e) => handleSearchPokemon(e.target.value)}
                                placeholder="Digite o nome..."
                                className="w-full bg-neutral-800 border-none text-white p-3 pl-10 font-pixel text-xs focus:ring-2 focus:ring-crimson outline-none"
                            />
                            <Search className="absolute left-3 top-3 text-gray-500" size={16} />
                        </div>
                        
                        <div className="h-64 overflow-y-auto border border-neutral-800 bg-black/50 mb-4 custom-scrollbar">
                            {searchResults.length === 0 ? (
                                <div className="p-4 text-gray-600 text-xs font-pixel text-center">
                                    {searchQuery ? "Nenhum resultado" : "Comece a digitar..."}
                                </div>
                            ) : (
                                searchResults.map(p => (
                                    <div 
                                        key={p.name}
                                        onClick={() => handleSelectPokemon(p.url)}
                                        className="p-3 border-b border-neutral-800 text-gray-300 font-pixel text-xs hover:bg-crimson hover:text-white cursor-pointer uppercase transition-colors"
                                    >
                                        {p.name}
                                    </div>
                                ))
                            )}
                        </div>

                        <button 
                            onClick={() => setSearchOpen(false)}
                            className="w-full py-3 border border-neutral-700 text-gray-500 font-pixel text-xs hover:text-white hover:border-white transition-colors"
                        >
                            Cancelar
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Gyms;
