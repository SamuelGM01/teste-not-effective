
import React, { useEffect, useState } from 'react';
import * as api from '../services/mockBackend';
import { useAuth } from '../contexts/AuthContext';
import { Tournament, TournamentFormat, Pokemon, TournamentParticipant, Match, getTypeIcon, TYPE_COLORS, getSkinUrl } from '../types';
import { Trophy, Users, Plus, X, Lock, Search, UserPlus, LogOut, Check, Eye, Swords, ShieldBan, Crown } from 'lucide-react';

const Tournaments: React.FC = () => {
    const { user } = useAuth();
    const [tournaments, setTournaments] = useState<Tournament[]>([]);
    
    // Create Modal State
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [newName, setNewName] = useState('');
    const [newFormat, setNewFormat] = useState<TournamentFormat>('monotype');
    const [admPass, setAdmPass] = useState('');
    
    // Register Doubles Modal State
    const [showDoublesRegister, setShowDoublesRegister] = useState<string | null>(null); // holds tournament ID
    const [doublesTeam, setDoublesTeam] = useState<(Pokemon | null)[]>([null, null, null, null]);
    const [activeSlot, setActiveSlot] = useState<number | null>(null);
    const [searchOpen, setSearchOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");
    const [searchResults, setSearchResults] = useState<{name: string, url: string}[]>([]);

    // Invite Modal State
    const [showInviteModal, setShowInviteModal] = useState<string | null>(null); // holds tournament ID
    const [availablePlayers, setAvailablePlayers] = useState<TournamentParticipant[]>([]);

    // Details/Bracket Modal State
    const [selectedTournament, setSelectedTournament] = useState<Tournament | null>(null);
    const [startPass, setStartPass] = useState('');
    const [showStartPassInput, setShowStartPassInput] = useState(false);

    // Match Control Modal State
    const [selectedMatch, setSelectedMatch] = useState<Match | null>(null);
    const [winnerSelection, setWinnerSelection] = useState<string[]>([]); // ID(s)
    const [advancePass, setAdvancePass] = useState('');
    const [showAdvancePass, setShowAdvancePass] = useState(false);

    useEffect(() => {
        loadTournaments();
    }, []);

    const loadTournaments = async () => {
        try {
            const data = await api.getTournaments();
            data.sort((a, b) => b.createdAt - a.createdAt);
            setTournaments(data);
            if (selectedTournament) {
                const fresh = data.find(t => t.id === selectedTournament.id);
                if (fresh) setSelectedTournament(fresh);
            }
            if (selectedMatch && selectedTournament) {
                const freshT = data.find(t => t.id === selectedTournament.id);
                const freshM = freshT?.matches.find(m => m.id === selectedMatch.id);
                if (freshM) setSelectedMatch(freshM);
            }
        } catch (error) {
            console.error("Failed to load tournaments:", error);
        }
    };

    const handleCreate = async () => {
        if (!newName) return alert("Nome é obrigatório");
        if (admPass !== "ADM001") return alert("Senha de Administrador incorreta!");

        await api.createTournament(newName, newFormat);
        setShowCreateModal(false);
        setNewName('');
        setAdmPass('');
        loadTournaments();
    };

    const handleJoin = async (t: Tournament, e: React.MouseEvent) => {
        e.stopPropagation();
        if (!user) return alert("Faça login para participar.");

        try {
            if (t.format === 'monotype') {
                await api.joinTournamentMonotype(t.id, user);
                alert("Inscrição confirmada! Time do ginásio importado.");
                loadTournaments();
            } else {
                setDoublesTeam([null, null, null, null]);
                setShowDoublesRegister(t.id);
            }
        } catch (error: any) {
            alert(error.message);
        }
    };

    const submitDoublesTeam = async () => {
        if (!user || !showDoublesRegister) return;
        const finalTeam = doublesTeam.filter(p => p !== null) as Pokemon[];
        if (finalTeam.length !== 4) return alert("Selecione exatamente 4 Pokémons.");

        try {
            await api.joinTournamentDoubles(showDoublesRegister, user, finalTeam);
            setShowDoublesRegister(null);
            loadTournaments();
        } catch (error: any) {
            alert(error.message);
        }
    };

    const handleSearchPokemon = async (query: string) => {
        setSearchQuery(query);
        const results = await api.searchPokemon(query);
        setSearchResults(results);
    };

    const handleSelectPokemon = async (url: string) => {
        if (activeSlot === null) return;
        const details = await api.getPokemonDetails(url);
        
        const newTeam = [...doublesTeam];
        newTeam[activeSlot] = details;
        setDoublesTeam(newTeam);
        
        setSearchOpen(false);
        setActiveSlot(null);
        setSearchQuery("");
    };

    const handleLeave = async (tournamentId: string, e: React.MouseEvent) => {
        e.stopPropagation();
        if (!user) return;
        if (!confirm("Sair do torneio? Se estiver em dupla, ela será desfeita.")) return;
        
        await api.leaveTournament(tournamentId, user._id);
        await loadTournaments();
    };

    const openInviteModal = (t: Tournament, e: React.MouseEvent) => {
        e.stopPropagation();
        if (!user) return;
        const candidates = t.participants.filter(p => 
            p.trainerId !== user._id && !p.partnerId
        );
        setAvailablePlayers(candidates);
        setShowInviteModal(t.id);
    };

    const sendInvite = async (targetNick: string) => {
        if (!user || !showInviteModal) return;
        try {
            const tournament = tournaments.find(t => t.id === showInviteModal);
            if (!tournament) return alert("Torneio não encontrado");

            await api.sendInvite(showInviteModal, tournament.name, user.nick, targetNick);
            alert(`Convite enviado para ${targetNick}!`);
            setShowInviteModal(null);
        } catch (error: any) {
            alert(error.message);
        }
    };

    const handleStartTournament = async () => {
        if (startPass !== "ADM001") return alert("Senha de Administrador incorreta!");
        if (!selectedTournament) return;

        try {
            await api.startTournament(selectedTournament.id);
            setShowStartPassInput(false);
            setStartPass('');
            await loadTournaments();
        } catch (error: any) {
            alert(error.message);
        }
    };

    const openMatch = (m: Match) => {
        setSelectedMatch(m);
        setWinnerSelection([]); 
        setShowAdvancePass(false);
    };

    const handleBan = async (targetTrainerId: string, pokeName: string) => {
        if (!selectedTournament || !selectedMatch || !user) return;
        
        const myParticipantData = selectedMatch.participants.find(p => p.trainerId === user._id);
        if (!myParticipantData) return; 

        const isMeOrPartner = targetTrainerId === user._id || targetTrainerId === myParticipantData.partnerId;
        
        if (isMeOrPartner) return alert("Você não pode banir seus próprios Pokémons!");

        try {
            await api.toggleBan(selectedTournament.id, selectedMatch.id, targetTrainerId, pokeName);
            await loadTournaments();
        } catch (error: any) {
            alert(error.message);
        }
    };

    const handleAdvanceRound = async () => {
        if (advancePass !== "ADM001") return alert("Senha incorreta!");
        if (!selectedTournament || !selectedMatch) return;
        if (winnerSelection.length === 0) return alert("Selecione o vencedor!");

        try {
            await api.declareMatchWinner(selectedTournament.id, selectedMatch.id, winnerSelection);
            setSelectedMatch(null);
            setAdvancePass('');
            setShowAdvancePass(false);
            await loadTournaments();
        } catch (error: any) {
            alert(error.message);
        }
    };

    const renderMonotypeDetails = (t: Tournament) => (
        <div className="flex flex-col gap-4">
            {t.participants.length === 0 ? <p className="text-gray-500 text-center text-xs">Nenhum participante.</p> : null}
            {t.participants.map(p => (
                <div key={p.trainerId} className="bg-black/40 border border-neutral-800 p-3 flex flex-col md:flex-row items-center gap-4">
                    <div className="flex items-center gap-3 w-full md:w-1/3 border-b md:border-b-0 md:border-r border-neutral-800 pb-2 md:pb-0">
                        {p.gymType && (
                            <div className="w-8 h-8 rounded-full flex items-center justify-center border border-white/20" style={{ backgroundColor: TYPE_COLORS[p.gymType] || '#333' }}>
                                <img src={getTypeIcon(p.gymType)} className="w-5 h-5 brightness-0 invert" />
                            </div>
                        )}
                        <div className="flex flex-col">
                            <span className="font-pixel text-xs text-white">{p.nick}</span>
                            <span className="text-[10px] text-gray-500 font-sans">Líder de {p.gymType || 'Desconhecido'}</span>
                        </div>
                    </div>
                    <div className="flex gap-2 flex-wrap justify-center">
                        {p.pokemon.map((poke, i) => (
                            <img key={i} src={poke.sprite} className="w-10 h-10 object-contain image-pixelated" title={poke.name} />
                        ))}
                    </div>
                </div>
            ))}
        </div>
    );

    const renderDoublesDetails = (t: Tournament) => {
        if (t.participants.length === 0) return <p className="text-gray-500 text-center text-xs">Nenhum participante.</p>;
        const visitedIds = new Set<string>();
        const pairs: React.ReactNode[] = [];
        const solos: React.ReactNode[] = [];

        t.participants.forEach(p => {
            if (visitedIds.has(p.trainerId)) return;
            if (p.partnerId) {
                const partner = t.participants.find(part => part.trainerId === p.partnerId);
                if (partner) {
                    visitedIds.add(p.trainerId);
                    visitedIds.add(partner.trainerId);
                    pairs.push(
                        <div key={p.trainerId} className="bg-neutral-900/50 border border-indigo-900/50 p-4 relative overflow-hidden">
                            <div className="absolute top-0 right-0 bg-indigo-900 text-indigo-100 text-[9px] font-pixel px-2 py-1">DUPLA CONFIRMADA</div>
                            <div className="flex flex-col gap-4 mt-2">
                                <div className="flex items-center justify-between border-b border-neutral-800 pb-2">
                                    <span className="font-pixel text-xs text-indigo-300">{p.nick}</span>
                                    <div className="flex gap-1">{p.pokemon.map((poke, i) => (<img key={i} src={poke.sprite} className="w-8 h-8 object-contain image-pixelated" title={poke.name} />))}</div>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="font-pixel text-xs text-indigo-300">{partner.nick}</span>
                                    <div className="flex gap-1">{partner.pokemon.map((poke, i) => (<img key={i} src={poke.sprite} className="w-8 h-8 object-contain image-pixelated" title={poke.name} />))}</div>
                                </div>
                            </div>
                        </div>
                    );
                }
            } else {
                visitedIds.add(p.trainerId);
                solos.push(<div key={p.trainerId} className="bg-black/40 border border-dashed border-neutral-700 p-3 flex items-center justify-between opacity-70"><span className="font-pixel text-xs text-gray-400">{p.nick}</span><div className="flex gap-1 grayscale opacity-50">{p.pokemon.map((poke, i) => (<img key={i} src={poke.sprite} className="w-6 h-6 object-contain image-pixelated" />))}</div></div>);
            }
        });

        return <div className="space-y-6">{pairs}{solos}</div>;
    };

    const renderBracket = (t: Tournament) => {
        const rounds: Record<number, Match[]> = {};
        t.matches.forEach(m => {
            if (!rounds[m.round]) rounds[m.round] = [];
            rounds[m.round].push(m);
        });

        return (
            <div className="flex flex-col gap-8 w-full overflow-x-auto">
                {Object.keys(rounds).map(roundNum => (
                    <div key={roundNum} className="min-w-[300px]">
                        <h3 className="text-crimson font-pixel text-center mb-4 uppercase text-xs">Round {roundNum}</h3>
                        <div className="flex flex-wrap justify-center gap-6">
                            {rounds[parseInt(roundNum)].map(m => {
                                const isCompleted = m.winners.length > 0;
                                return (
                                    <div 
                                        key={m.id} 
                                        onClick={() => openMatch(m)}
                                        className={`
                                            w-64 bg-neutral-900 border-2 p-4 relative cursor-pointer hover:scale-105 transition-all
                                            ${isCompleted ? 'border-green-800' : 'border-neutral-700 hover:border-crimson'}
                                        `}
                                    >
                                        <div className="flex flex-col gap-2">
                                            <div className="flex items-center gap-2">
                                                <img src={getSkinUrl(m.participants[0].nick, m.participants[0].customSkin, 30)} className="w-6 h-6 image-pixelated" />
                                                <span className={`text-[10px] font-pixel ${m.winners.includes(m.participants[0].trainerId) ? 'text-green-400' : 'text-white'}`}>
                                                    {m.participants[0].nick} {t.format === 'doubles' && `& ${m.participants[1].nick}`}
                                                </span>
                                            </div>
                                            
                                            <div className="h-px bg-neutral-700 w-full" />
                                            
                                            {m.participants.length > (t.format === 'monotype' ? 1 : 2) ? (
                                                <div className="flex items-center gap-2">
                                                    <img src={getSkinUrl(m.participants[t.format === 'monotype' ? 1 : 2].nick, m.participants[t.format === 'monotype' ? 1 : 2].customSkin, 30)} className="w-6 h-6 image-pixelated" />
                                                    <span className={`text-[10px] font-pixel ${m.winners.includes(m.participants[t.format === 'monotype' ? 1 : 2].trainerId) ? 'text-green-400' : 'text-white'}`}>
                                                        {m.participants[t.format === 'monotype' ? 1 : 2].nick} {t.format === 'doubles' && `& ${m.participants[3].nick}`}
                                                    </span>
                                                </div>
                                            ) : (
                                                <span className="text-xs text-gray-500 italic">BYE (Avança)</span>
                                            )}
                                        </div>
                                        {isCompleted && <div className="absolute top-2 right-2 text-green-500"><Check size={16} /></div>}
                                    </div>
                                )
                            })}
                        </div>
                    </div>
                ))}
            </div>
        );
    };

    return (
        <div className="w-full max-w-6xl mx-auto flex flex-col items-center">
            
            <div className="w-full flex justify-between items-center mb-8 px-4">
                <h1 className="font-pixel text-crimson text-2xl drop-shadow-md">Torneios</h1>
                <button 
                    onClick={() => setShowCreateModal(true)}
                    className="flex items-center gap-2 bg-neutral-800 border border-neutral-600 text-white px-4 py-2 hover:bg-crimson hover:border-white transition-all font-pixel text-xs"
                >
                    <Plus size={14} /> Novo Torneio
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full px-4">
                {tournaments.map(t => {
                    const isParticipating = user && t.participants.some(p => p.trainerId === user._id);
                    const myParticipantData = user ? t.participants.find(p => p.trainerId === user._id) : null;
                    const isPaired = !!myParticipantData?.partnerId;

                    return (
                        <div 
                            key={t.id} 
                            onClick={() => setSelectedTournament(t)}
                            className="bg-card border border-neutral-800 p-6 relative overflow-hidden group hover:border-crimson transition-colors cursor-pointer"
                        >
                            <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                <span className="text-[10px] text-crimson font-pixel uppercase flex items-center gap-1 bg-black px-2 py-1 border border-crimson">
                                    <Eye size={10} /> Ver Detalhes
                                </span>
                            </div>

                            <div className="flex justify-between items-start mb-4 pointer-events-none">
                                <div>
                                    <h2 className="text-white font-pixel text-lg mb-1">{t.name}</h2>
                                    <div className="flex gap-2">
                                        <span className={`text-[10px] font-bold uppercase px-2 py-1 rounded ${t.format === 'monotype' ? 'bg-blue-900 text-blue-200' : 'bg-orange-900 text-orange-200'}`}>
                                            {t.format}
                                        </span>
                                        {t.status === 'active' && <span className="text-[10px] font-bold uppercase px-2 py-1 rounded bg-green-900 text-green-200 animate-pulse">EM ANDAMENTO</span>}
                                        {t.status === 'completed' && <span className="text-[10px] font-bold uppercase px-2 py-1 rounded bg-yellow-900 text-yellow-200">FINALIZADO</span>}
                                    </div>
                                </div>
                                <Trophy className="text-yellow-600 opacity-50" size={32} />
                            </div>

                            <div className="mb-6 pointer-events-none">
                                <div className="flex items-center gap-2 text-gray-400 text-sm font-sans mb-2">
                                    <Users size={14} /> {t.participants.length} Inscritos
                                </div>
                                
                                {isParticipating && t.status === 'pending' && (
                                    <div className="bg-green-900/20 border border-green-900/50 p-3 rounded mb-2">
                                        <p className="text-green-400 text-xs font-pixel flex items-center gap-2">
                                            <Check size={12} /> Inscrito
                                        </p>
                                        {t.format === 'doubles' && !isPaired && <span className="text-yellow-500 text-[10px] animate-pulse">Aguardando dupla...</span>}
                                    </div>
                                )}
                            </div>

                            <div className="flex gap-2 mt-auto relative z-10">
                                {t.status === 'pending' && !isParticipating && (
                                    <button 
                                        onClick={(e) => handleJoin(t, e)}
                                        className="flex-1 bg-crimson text-white font-pixel text-xs py-3 hover:bg-red-700 transition-colors uppercase shadow-lg"
                                    >
                                        Inscrever-se
                                    </button>
                                )}
                                {t.status === 'pending' && isParticipating && (
                                    <>
                                        {t.format === 'doubles' && !isPaired && (
                                            <button 
                                                onClick={(e) => openInviteModal(t, e)}
                                                className="flex-1 bg-indigo-600 text-white font-pixel text-[10px] py-3 hover:bg-indigo-700 transition-colors uppercase flex items-center justify-center gap-2"
                                            >
                                                <UserPlus size={12} /> Formar Dupla
                                            </button>
                                        )}
                                        <button 
                                            onClick={(e) => handleLeave(t.id, e)}
                                            className="bg-neutral-800 border border-neutral-600 text-gray-400 px-3 hover:text-white hover:border-white transition-colors flex items-center justify-center gap-2"
                                            title="Sair do Torneio"
                                        >
                                            <LogOut size={16} />
                                        </button>
                                    </>
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>

            {selectedTournament && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/95 backdrop-blur-md p-4">
                    <div className="bg-neutral-900 border border-neutral-700 p-0 w-full max-w-5xl shadow-[0_0_50px_rgba(0,0,0,0.8)] relative flex flex-col max-h-[90vh]">
                        
                        <div className="p-6 border-b border-neutral-800 flex justify-between items-center bg-neutral-950">
                            <div className="flex items-center gap-4">
                                <h2 className="font-pixel text-white text-lg uppercase">{selectedTournament.name}</h2>
                                {selectedTournament.status === 'pending' && (
                                    <div className="flex items-center gap-2">
                                        {!showStartPassInput ? (
                                            <button onClick={() => setShowStartPassInput(true)} className="bg-green-700 text-white font-pixel text-[10px] px-3 py-1 hover:bg-green-600">
                                                INICIAR TORNEIO
                                            </button>
                                        ) : (
                                            <div className="flex gap-2">
                                                <input 
                                                    type="password" 
                                                    placeholder="Senha ADM001" 
                                                    value={startPass}
                                                    onChange={e => setStartPass(e.target.value)}
                                                    className="bg-black border border-green-700 text-white px-2 py-1 text-xs font-sans w-24"
                                                />
                                                <button onClick={handleStartTournament} className="bg-green-600 text-white px-2 py-1 text-xs"><Check size={14} /></button>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                            <button onClick={() => setSelectedTournament(null)} className="text-gray-500 hover:text-white"><X size={24} /></button>
                        </div>

                        <div className="p-6 overflow-y-auto custom-scrollbar flex-grow">
                             {selectedTournament.status === 'pending' ? (
                                 selectedTournament.format === 'monotype' 
                                    ? renderMonotypeDetails(selectedTournament) 
                                    : renderDoublesDetails(selectedTournament)
                             ) : (
                                 renderBracket(selectedTournament)
                             )}
                        </div>
                    </div>
                </div>
            )}

            {selectedMatch && selectedTournament && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/90 backdrop-blur-md p-4">
                    <div className="bg-neutral-900 border-2 border-crimson p-0 w-full max-w-4xl shadow-2xl relative max-h-[90vh] overflow-y-auto">
                        <div className="bg-crimson p-2 flex justify-between items-center sticky top-0 z-10">
                            <h3 className="text-white font-pixel text-xs uppercase">Detalhes da Partida - Round {selectedMatch.round}</h3>
                            <button onClick={() => setSelectedMatch(null)} className="text-white"><X size={20} /></button>
                        </div>

                        <div className="p-6 flex flex-col gap-8">
                            <div className="flex flex-col md:flex-row justify-between items-center gap-8">
                                <div className="flex-1 w-full bg-black/40 p-4 border border-neutral-800 text-center">
                                    <div className="flex flex-col items-center mb-4">
                                        <div className="flex gap-4 mb-2">
                                            <img src={getSkinUrl(selectedMatch.participants[0].nick, selectedMatch.participants[0].customSkin, 60)} className="border-2 border-neutral-700 w-[60px] h-[60px] image-pixelated" />
                                            {selectedTournament.format === 'doubles' && (
                                                <img src={getSkinUrl(selectedMatch.participants[1].nick, selectedMatch.participants[1].customSkin, 60)} className="border-2 border-neutral-700 w-[60px] h-[60px] image-pixelated" />
                                            )}
                                        </div>
                                        <h4 className="text-white font-pixel text-sm">
                                            {selectedMatch.participants[0].nick} 
                                            {selectedTournament.format === 'doubles' && ` & ${selectedMatch.participants[1].nick}`}
                                        </h4>
                                    </div>
                                    
                                    <div className={`grid gap-2 justify-items-center ${selectedTournament.format === 'doubles' ? 'grid-cols-4' : 'grid-cols-3'}`}>
                                        {(selectedTournament.format === 'monotype' ? selectedMatch.participants[0].pokemon : [...selectedMatch.participants[0].pokemon, ...selectedMatch.participants[1].pokemon]).map((poke, i) => {
                                            const isBanned = selectedMatch.bans[selectedMatch.participants[0].trainerId]?.includes(poke.name) || 
                                                             (selectedTournament.format === 'doubles' && selectedMatch.bans[selectedMatch.participants[1].trainerId]?.includes(poke.name));
                                            
                                            const ownerId = (selectedTournament.format === 'doubles' && i >= 4) ? selectedMatch.participants[1].trainerId : selectedMatch.participants[0].trainerId;

                                            return (
                                                <div 
                                                    key={i} 
                                                    className="relative group cursor-pointer"
                                                    onClick={() => selectedTournament.format === 'doubles' && handleBan(ownerId, poke.name)}
                                                >
                                                    <img 
                                                        src={poke.sprite} 
                                                        className={`w-12 h-12 object-contain image-pixelated transition-all ${isBanned ? 'grayscale opacity-50' : ''}`} 
                                                    />
                                                    {isBanned && <div className="absolute inset-0 flex items-center justify-center text-red-600 font-bold text-2xl drop-shadow-md select-none">X</div>}
                                                    {selectedTournament.format === 'doubles' && !isBanned && (
                                                        <div className="absolute inset-0 bg-black/60 text-white text-[8px] flex items-center justify-center opacity-0 group-hover:opacity-100 font-pixel uppercase">
                                                            BANIR
                                                        </div>
                                                    )}
                                                </div>
                                            )
                                        })}
                                    </div>
                                </div>

                                <Swords size={32} className="text-gray-600 hidden md:block" />

                                {selectedMatch.participants.length > (selectedTournament.format === 'monotype' ? 1 : 2) ? (
                                    <div className="flex-1 w-full bg-black/40 p-4 border border-neutral-800 text-center">
                                         <div className="flex flex-col items-center mb-4">
                                            <div className="flex gap-4 mb-2">
                                                <img src={getSkinUrl(selectedMatch.participants[selectedTournament.format === 'monotype' ? 1 : 2].nick, selectedMatch.participants[selectedTournament.format === 'monotype' ? 1 : 2].customSkin, 60)} className="border-2 border-neutral-700 w-[60px] h-[60px] image-pixelated" />
                                                {selectedTournament.format === 'doubles' && (
                                                    <img src={getSkinUrl(selectedMatch.participants[3].nick, selectedMatch.participants[3].customSkin, 60)} className="border-2 border-neutral-700 w-[60px] h-[60px] image-pixelated" />
                                                )}
                                            </div>
                                            <h4 className="text-white font-pixel text-sm">
                                                {selectedMatch.participants[selectedTournament.format === 'monotype' ? 1 : 2].nick}
                                                {selectedTournament.format === 'doubles' && ` & ${selectedMatch.participants[3].nick}`}
                                            </h4>
                                        </div>

                                        <div className={`grid gap-2 justify-items-center ${selectedTournament.format === 'doubles' ? 'grid-cols-4' : 'grid-cols-3'}`}>
                                            {(selectedTournament.format === 'monotype' 
                                                ? selectedMatch.participants[1].pokemon 
                                                : [...selectedMatch.participants[2].pokemon, ...selectedMatch.participants[3].pokemon]
                                            ).map((poke, i) => {
                                                const p2Idx = selectedTournament.format === 'monotype' ? 1 : 2;
                                                const p3Idx = 3;
                                                const ownerId = (selectedTournament.format === 'doubles' && i >= 4) ? selectedMatch.participants[p3Idx].trainerId : selectedMatch.participants[p2Idx].trainerId;
                                                
                                                const isBanned = selectedMatch.bans[ownerId]?.includes(poke.name);

                                                return (
                                                    <div 
                                                        key={i} 
                                                        className="relative group cursor-pointer"
                                                        onClick={() => selectedTournament.format === 'doubles' && handleBan(ownerId, poke.name)}
                                                    >
                                                        <img 
                                                            src={poke.sprite} 
                                                            className={`w-12 h-12 object-contain image-pixelated transition-all ${isBanned ? 'grayscale opacity-50' : ''}`} 
                                                        />
                                                        {isBanned && <div className="absolute inset-0 flex items-center justify-center text-red-600 font-bold text-2xl drop-shadow-md select-none">X</div>}
                                                        {selectedTournament.format === 'doubles' && !isBanned && (
                                                            <div className="absolute inset-0 bg-black/60 text-white text-[8px] flex items-center justify-center opacity-0 group-hover:opacity-100 font-pixel uppercase">
                                                                BANIR
                                                            </div>
                                                        )}
                                                    </div>
                                                )
                                            })}
                                        </div>
                                    </div>
                                ) : (
                                    <div className="flex-1 flex items-center justify-center text-gray-500 font-pixel text-xs">BYE (Vitória Automática)</div>
                                )}
                            </div>

                            {selectedMatch.winners.length === 0 && (
                                <div className="bg-neutral-800 p-4 border-t border-neutral-600">
                                    <h4 className="text-white font-pixel text-xs mb-4 text-center uppercase flex items-center justify-center gap-2">
                                        <Crown size={14} className="text-yellow-500"/> Definir Vencedor (Admin)
                                    </h4>
                                    
                                    <div className="flex justify-center gap-6 mb-4">
                                        <label className="flex items-center gap-2 cursor-pointer">
                                            <input 
                                                type="radio" 
                                                name="winner" 
                                                onChange={() => {
                                                    const ids = [selectedMatch.participants[0].trainerId];
                                                    if (selectedTournament.format === 'doubles') ids.push(selectedMatch.participants[1].trainerId);
                                                    setWinnerSelection(ids);
                                                    setShowAdvancePass(true);
                                                }}
                                            />
                                            <span className="text-gray-300 font-sans text-sm">Time 1</span>
                                        </label>

                                        {selectedMatch.participants.length > (selectedTournament.format === 'monotype' ? 1 : 2) && (
                                            <label className="flex items-center gap-2 cursor-pointer">
                                                <input 
                                                    type="radio" 
                                                    name="winner" 
                                                    onChange={() => {
                                                        const p2Idx = selectedTournament.format === 'monotype' ? 1 : 2;
                                                        const ids = [selectedMatch.participants[p2Idx].trainerId];
                                                        if (selectedTournament.format === 'doubles') ids.push(selectedMatch.participants[3].trainerId);
                                                        setWinnerSelection(ids);
                                                        setShowAdvancePass(true);
                                                    }}
                                                />
                                                <span className="text-gray-300 font-sans text-sm">Time 2</span>
                                            </label>
                                        )}
                                    </div>

                                    {showAdvancePass && (
                                        <div className="flex justify-center gap-2 items-center">
                                            <input 
                                                type="password" 
                                                placeholder="Senha ADM001" 
                                                value={advancePass}
                                                onChange={e => setAdvancePass(e.target.value)}
                                                className="bg-black border border-neutral-500 text-white px-3 py-2 text-xs font-sans w-32 focus:border-crimson outline-none"
                                            />
                                            <button 
                                                onClick={handleAdvanceRound}
                                                className="bg-crimson text-white font-pixel text-[10px] px-4 py-2 hover:bg-red-700 uppercase"
                                            >
                                                Avançar Rodada
                                            </button>
                                        </div>
                                    )}
                                </div>
                            )}
                            
                            {selectedMatch.winners.length > 0 ? (
                                <div className="text-center text-green-500 font-pixel text-sm uppercase p-4 bg-green-900/20 border border-green-800">
                                    Partida Concluída
                                </div>
                            ) : (
                                <div className="flex justify-center">
                                    <button 
                                        onClick={() => setSelectedMatch(null)}
                                        className="bg-green-700 text-white font-pixel text-xs py-3 px-12 hover:bg-green-600 uppercase shadow-lg"
                                    >
                                        OK
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {showCreateModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-sm p-4">
                    <div className="bg-neutral-900 border border-neutral-700 p-6 w-full max-w-md shadow-2xl relative">
                        <button onClick={() => setShowCreateModal(false)} className="absolute top-4 right-4 text-gray-500 hover:text-white"><X size={20} /></button>
                        <h2 className="font-pixel text-white text-sm mb-6 uppercase text-center">Criar Novo Torneio</h2>
                        <div className="space-y-4">
                            <input type="text" placeholder="Nome do Torneio" value={newName} onChange={e => setNewName(e.target.value)} className="w-full bg-black/50 border border-neutral-700 p-3 text-white text-sm focus:border-crimson outline-none font-sans" />
                            <div className="flex gap-4">
                                <button onClick={() => setNewFormat('monotype')} className={`flex-1 py-3 text-xs font-pixel border ${newFormat === 'monotype' ? 'bg-crimson border-crimson text-white' : 'border-neutral-700 text-gray-500'}`}>Monotype</button>
                                <button onClick={() => setNewFormat('doubles')} className={`flex-1 py-3 text-xs font-pixel border ${newFormat === 'doubles' ? 'bg-crimson border-crimson text-white' : 'border-neutral-700 text-gray-500'}`}>Doubles</button>
                            </div>
                            <div className="relative"><Lock size={14} className="absolute top-3.5 left-3 text-gray-500" /><input type="password" placeholder="Senha ADM" value={admPass} onChange={e => setAdmPass(e.target.value)} className="w-full bg-black/50 border border-neutral-700 p-3 pl-10 text-white text-sm focus:border-crimson outline-none font-sans" /></div>
                            <button onClick={handleCreate} className="w-full bg-white text-black font-bold py-3 mt-2 hover:bg-gray-200 font-pixel text-xs">CONFIRMAR</button>
                        </div>
                    </div>
                </div>
            )}

            {showDoublesRegister && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-sm p-4">
                    <div className="bg-neutral-900 border border-neutral-700 p-6 w-full max-w-lg shadow-2xl relative">
                        <button onClick={() => setShowDoublesRegister(null)} className="absolute top-4 right-4 text-gray-500 hover:text-white"><X size={20} /></button>
                        <h2 className="font-pixel text-white text-sm mb-2 uppercase text-center">Inscrição Doubles</h2>
                        <p className="text-gray-500 text-xs text-center mb-6">Selecione 4 Pokémons para sua equipe</p>
                        <div className="grid grid-cols-4 gap-2 mb-6">
                            {doublesTeam.map((poke, idx) => (
                                <div key={idx} onClick={() => { setActiveSlot(idx); setSearchOpen(true); }} className="aspect-square bg-black/50 border border-neutral-700 flex flex-col items-center justify-center cursor-pointer hover:border-crimson relative group">
                                    {poke ? (<><img src={poke.sprite} className="w-10 h-10 object-contain image-pixelated" /><span className="text-[8px] mt-1 text-gray-300">{poke.name}</span><div onClick={(e) => { e.stopPropagation(); const n = [...doublesTeam]; n[idx]=null; setDoublesTeam(n); }} className="absolute top-1 right-1 hidden group-hover:block bg-red-900 text-white rounded-full p-0.5"><X size={8} /></div></>) : (<Plus className="text-gray-600" />)}
                                </div>
                            ))}
                        </div>
                        <button onClick={submitDoublesTeam} className="w-full bg-crimson text-white font-bold py-3 hover:bg-red-700 font-pixel text-xs">FINALIZAR INSCRIÇÃO</button>
                    </div>
                </div>
            )}

            {searchOpen && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/95 backdrop-blur-md p-4">
                    <div className="bg-neutral-900 border border-neutral-700 w-full max-w-md p-6 shadow-2xl">
                        <h3 className="font-pixel text-white text-sm mb-4 text-center">Escolha o Pokémon</h3>
                        <div className="relative mb-4">
                            <input autoFocus type="text" value={searchQuery} onChange={(e) => handleSearchPokemon(e.target.value)} placeholder="Digite o nome..." className="w-full bg-neutral-800 border-none text-white p-3 pl-10 font-pixel text-xs focus:ring-2 focus:ring-crimson outline-none" />
                            <Search className="absolute left-3 top-3 text-gray-500" size={16} />
                        </div>
                        <div className="h-64 overflow-y-auto border border-neutral-800 bg-black/50 mb-4 custom-scrollbar">
                            {searchResults.map(p => (
                                <div key={p.name} onClick={() => handleSelectPokemon(p.url)} className="p-3 border-b border-neutral-800 text-gray-300 font-pixel text-xs hover:bg-crimson hover:text-white cursor-pointer uppercase">{p.name}</div>
                            ))}
                        </div>
                        <button onClick={() => setSearchOpen(false)} className="w-full py-2 border border-neutral-700 text-gray-500 text-xs">Cancelar</button>
                    </div>
                </div>
            )}

            {showInviteModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-sm p-4">
                    <div className="bg-neutral-900 border border-neutral-700 p-6 w-full max-w-sm shadow-2xl relative">
                        <button onClick={() => setShowInviteModal(null)} className="absolute top-4 right-4 text-gray-500 hover:text-white"><X size={20} /></button>
                        <h2 className="font-pixel text-white text-sm mb-4 uppercase text-center">Convidar Dupla</h2>
                        <div className="max-h-60 overflow-y-auto custom-scrollbar space-y-2 mb-4">
                            {availablePlayers.length === 0 ? <p className="text-gray-500 text-xs text-center py-4">Nenhum jogador disponível.</p> : availablePlayers.map(p => (<div key={p.trainerId} onClick={() => sendInvite(p.nick)} className="flex items-center gap-3 p-3 bg-black/40 hover:bg-neutral-800 cursor-pointer border border-transparent hover:border-neutral-600 transition-colors"><img src={getSkinUrl(p.nick, p.customSkin, 40)} className="w-8 h-8" /><span className="text-white font-pixel text-xs">{p.nick}</span></div>))}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Tournaments;