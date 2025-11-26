
import React, { useEffect, useState } from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import GymsPage from './pages/GymsPage';
import Trainers from './pages/Trainers';
import Tournaments from './pages/Tournaments';
import { useAuth } from './contexts/AuthContext';
import * as api from './services/mockBackend';
import { Invite } from './types';
import { Mail, Check, X } from 'lucide-react';

const InviteListener: React.FC = () => {
    const { user } = useAuth();
    const [invites, setInvites] = useState<Invite[]>([]);

    useEffect(() => {
        if (user) {
            // Initial check
            checkInvites();
            
            // Poll every 3 seconds to keep invites persistent and catch new ones in real-time
            const interval = setInterval(checkInvites, 3000);
            return () => clearInterval(interval);
        }
    }, [user]);

    const checkInvites = async () => {
        if (!user) return;
        const pending = await api.getInvites(user.nick);
        // We only update if length changes to avoid unnecessary re-renders causing UI flickers
        setInvites(prev => {
            if (JSON.stringify(prev) !== JSON.stringify(pending)) {
                return pending;
            }
            return prev;
        });
    };

    const handleRespond = async (inviteId: string, accept: boolean) => {
        await api.respondToInvite(inviteId, accept);
        // Immediate UI update
        setInvites(prev => prev.filter(i => i.id !== inviteId));
        if (accept) {
            alert("Convite aceito! Vocês agora são uma dupla.");
        }
    };

    if (invites.length === 0) return null;

    return (
        <div className="fixed bottom-4 right-4 z-[100] flex flex-col gap-2 pointer-events-none">
            {invites.map(invite => (
                <div 
                    key={invite.id} 
                    className="bg-neutral-900 border-2 border-crimson p-4 shadow-2xl w-72 pointer-events-auto transition-transform duration-300 ease-out translate-y-0"
                >
                    <div className="flex items-center gap-2 mb-2 text-crimson font-pixel text-xs uppercase animate-pulse">
                        <Mail size={14} /> Convite de Dupla
                    </div>
                    <p className="text-white text-xs mb-3 font-sans">
                        <strong className="text-white">{invite.fromNick}</strong> te convidou para o torneio <strong className="text-gray-400">{invite.tournamentName}</strong>.
                    </p>
                    <div className="flex gap-2">
                        <button 
                            onClick={() => handleRespond(invite.id, true)}
                            className="flex-1 bg-green-700 hover:bg-green-600 text-white py-1 px-2 text-[10px] font-pixel flex items-center justify-center gap-1"
                        >
                            <Check size={10} /> Aceitar
                        </button>
                        <button 
                            onClick={() => handleRespond(invite.id, false)}
                            className="flex-1 bg-neutral-700 hover:bg-neutral-600 text-white py-1 px-2 text-[10px] font-pixel flex items-center justify-center gap-1"
                        >
                            <X size={10} /> Recusar
                        </button>
                    </div>
                </div>
            ))}
        </div>
    );
};

const App: React.FC = () => {
    return (
        <HashRouter>
            <div className="min-h-screen flex flex-col font-sans">
                <Navbar />
                <InviteListener />
                <main className="flex-grow flex flex-col items-center justify-start py-12 px-4">
                    <Routes>
                        <Route path="/" element={<Home />} />
                        <Route path="/ginasios" element={<GymsPage />} />
                        <Route path="/treinadores" element={<Trainers />} />
                        <Route path="/torneios" element={<Tournaments />} />
                        <Route path="*" element={<Navigate to="/" replace />} />
                    </Routes>
                </main>
                <footer className="w-full py-6 text-center text-neutral-600 text-xs font-sans tracking-widest">
                    &copy; {new Date().getFullYear()} NOT EFFECTIVE SERVER
                </footer>
            </div>
        </HashRouter>
    );
};

export default App;
