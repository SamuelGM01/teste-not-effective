
import React, { useEffect, useState } from 'react';
import { Trainer, GYM_TYPES, TYPE_COLORS, getTypeIcon, getSkinUrl } from '../types';
import * as api from '../services/mockBackend';
import { useAuth } from '../contexts/AuthContext';
import { Trash2 } from 'lucide-react';

const Trainers: React.FC = () => {
    const { user, isAdmin } = useAuth();
    const [trainers, setTrainers] = useState<Trainer[]>([]);

    useEffect(() => {
        loadTrainers();
    }, []);

    const loadTrainers = async () => {
        try {
            const data = await api.getTrainers();
            data.sort((a, b) => a.nick.localeCompare(b.nick));
            setTrainers(data);
        } catch (error) {
            console.error("Failed to load trainers:", error);
        }
    };

    const handleDeleteTrainer = async (id: string) => {
        if (!isAdmin) return;
        if (confirm("Tem certeza que deseja remover este treinador?")) {
            await api.deleteTrainer(id);
            await loadTrainers();
        }
    };

    const handleToggleBadge = async (trainerId: string, badgeId: string, trainerNick: string) => {
        if (!user) return;
        const canEdit = isAdmin || user.nick.toLowerCase() === trainerNick.toLowerCase();
        
        if (!canEdit) return;

        await api.toggleInsignia(trainerId, badgeId);
        await loadTrainers();
    };

    return (
        <div className="w-full max-w-6xl mx-auto flex flex-col items-center">
            <div className="bg-card w-full max-w-4xl p-8 md:p-12 border border-neutral-800 shadow-2xl backdrop-blur-md rounded-sm">
                <h1 className="font-pixel text-crimson text-xl md:text-2xl mb-4 text-center">Treinadores</h1>
                <p className="text-gray-400 text-sm mb-10 text-center font-sans">
                    Progresso dos jogadores no campeonato
                </p>

                <div className="w-full flex flex-col items-center gap-6">
                    {trainers.map(trainer => (
                        <div key={trainer._id} className="w-full max-w-3xl bg-[#1a1a1a] border border-neutral-800 p-5 flex flex-col sm:flex-row items-center relative group hover:border-neutral-600 transition-colors">
                            {isAdmin && (
                                <button 
                                    onClick={() => handleDeleteTrainer(trainer._id)}
                                    className="absolute top-3 right-3 text-neutral-600 hover:text-crimson transition-colors"
                                >
                                    <Trash2 size={18} />
                                </button>
                            )}

                            <div className="flex-shrink-0 mb-4 sm:mb-0 sm:mr-6">
                                <img 
                                    src={getSkinUrl(trainer.nick, trainer.customSkin)} 
                                    alt={trainer.nick}
                                    className="w-20 h-20 border-2 border-neutral-700 image-pixelated bg-neutral-800"
                                />
                            </div>

                            <div className="flex-grow w-full">
                                <h3 className="font-pixel text-white text-sm mb-4 text-center sm:text-left">
                                    {trainer.nick}
                                    {user && user.nick === trainer.nick && (
                                        <span className="ml-2 text-[10px] text-gray-500 font-sans tracking-wide">(VOCÊ)</span>
                                    )}
                                </h3>
                                
                                <div className="grid grid-cols-9 gap-2 justify-items-center w-full">
                                    {GYM_TYPES.map(tipo => {
                                        const hasBadge = trainer.insignias.includes(tipo);
                                        const canEdit = user && (isAdmin || user.nick === trainer.nick);
                                        
                                        return (
                                            <div 
                                                key={tipo}
                                                onClick={() => handleToggleBadge(trainer._id, tipo, trainer.nick)}
                                                className={`
                                                    w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center transition-all duration-200 overflow-hidden
                                                    ${hasBadge ? 'scale-110 shadow-[0_0_10px_rgba(255,255,255,0.3)]' : 'opacity-20 grayscale'}
                                                    ${canEdit ? 'cursor-pointer hover:scale-105 hover:opacity-50' : 'cursor-default'}
                                                `}
                                                style={{ backgroundColor: hasBadge ? TYPE_COLORS[tipo] : '#333' }}
                                                title={tipo}
                                            >
                                                <img 
                                                    src={getTypeIcon(tipo)} 
                                                    alt={tipo}
                                                    className="w-3/5 h-3/5 object-contain brightness-0 invert"
                                                />
                                            </div>
                                        )
                                    })}
                                </div>
                            </div>
                        </div>
                    ))}

                    <div className="text-neutral-600 text-xs font-pixel mt-4">
                        Novos treinadores devem se registrar na página inicial.
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Trainers;