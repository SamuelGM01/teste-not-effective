
import React, { useState, useRef, useEffect } from 'react';
import * as api from '../services/mockBackend';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { X, Upload } from 'lucide-react';

const Home: React.FC = () => {
    const { user, login, logout } = useAuth();
    const [modalMode, setModalMode] = useState<'login' | 'register' | null>(null);
    const [nick, setNick] = useState('');
    const [password, setPassword] = useState('');
    const [customSkin, setCustomSkin] = useState<string>('');
    const [error, setError] = useState('');
    const [serverStatus, setServerStatus] = useState<{online: boolean, players: number}>({ online: false, players: 0 });
    const [copied, setCopied] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchServerStatus = async () => {
            try {
                // Using mcstatus.io for better reliability and detailed player info if needed
                const response = await fetch(`https://api.mcstatus.io/v2/status/java/jasper.lura.host:35570`);
                const data = await response.json();
                
                if (data.online) {
                    setServerStatus({
                        online: true,
                        players: data.players ? (data.players.online || 0) : 0
                    });
                } else {
                    setServerStatus({ online: false, players: 0 });
                }
            } catch (err) {
                console.error("Erro ao buscar status do servidor", err);
                setServerStatus({ online: false, players: 0 });
            }
        };

        fetchServerStatus();
        const interval = setInterval(fetchServerStatus, 60000); // Atualiza a cada 1 minuto
        return () => clearInterval(interval);
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        
        try {
            if (modalMode === 'login') {
                const trainer = await api.login(nick, password);
                login(trainer);
                setModalMode(null);
            } else if (modalMode === 'register') {
                if (password.length < 3) throw new Error("A senha deve ter pelo menos 3 caracteres.");
                const trainer = await api.createTrainer(nick, password, customSkin || undefined);
                login(trainer);
                setModalMode(null);
            }
        } catch (err: any) {
            setError(err.message || "Ocorreu um erro.");
        }
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (event) => {
                const img = new Image();
                img.src = event.target?.result as string;
                img.onload = () => {
                    const canvas = document.createElement('canvas');
                    const ctx = canvas.getContext('2d');
                    const size = 64; 
                    canvas.width = size;
                    canvas.height = size;

                    if (ctx) {
                        ctx.imageSmoothingEnabled = false;
                        ctx.drawImage(img, 8, 8, 8, 8, 0, 0, size, size);
                        ctx.drawImage(img, 40, 8, 8, 8, 0, 0, size, size);
                        const croppedFace = canvas.toDataURL('image/png');
                        setCustomSkin(croppedFace);
                    }
                };
            };
            reader.readAsDataURL(file);
        }
    };

    const handleCopyIp = () => {
        navigator.clipboard.writeText("jasper.lura.host:35570");
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <div className="flex flex-col items-center justify-center min-h-[70vh] w-full px-4">
            <div className="relative mb-12">
                <div className="text-center">
                    <h1 className="font-pixel text-5xl md:text-7xl text-white drop-shadow-[0_0_20px_rgba(220,20,60,0.5)]">
                        NOT<br/>
                        <span className="text-crimson">EFFECTIVE</span>
                    </h1>
                    <p className="mt-6 text-gray-400 font-sans tracking-[0.5em] text-sm md:text-lg">
                        COBBLEMON CHAMPIONSHIP
                    </p>
                </div>
            </div>

            {user ? (
                <div className="flex flex-col items-center gap-4 mb-8">
                    <p className="text-white font-pixel text-sm">
                        Bem-vindo, <span className="text-crimson">{user.nick}</span>!
                    </p>
                    <button 
                        onClick={logout}
                        className="bg-transparent border border-neutral-600 text-gray-400 py-2 px-6 font-pixel text-xs hover:border-crimson hover:text-white transition-colors"
                    >
                        LOGOUT
                    </button>
                </div>
            ) : (
                <div className="flex flex-col items-center gap-10 mb-8">
                    <div className="flex flex-col sm:flex-row gap-6">
                        <button 
                            onClick={() => { setModalMode('register'); setError(''); setCustomSkin(''); }}
                            className="bg-crimson text-white font-bold py-3 px-8 font-sans uppercase tracking-widest text-sm hover:bg-red-700 hover:scale-105 transition-all shadow-[0_0_15px_rgba(220,20,60,0.4)]"
                        >
                            Novo Desafiante
                        </button>
                        <button 
                            onClick={() => { setModalMode('login'); setError(''); }}
                            className="bg-transparent border-2 border-white text-white font-bold py-3 px-8 font-sans uppercase tracking-widest text-sm hover:bg-white hover:text-black hover:scale-105 transition-all"
                        >
                            Login
                        </button>
                    </div>
                </div>
            )}

            {/* Contador de Players - Exibido Sempre (Logado ou Não) */}
            <div className="flex flex-col items-center gap-3">
                <div 
                    onClick={handleCopyIp}
                    className="relative group cursor-pointer"
                    title="Clique para copiar o IP"
                >
                    {/* Glow Effect Background */}
                    {serverStatus.online && (
                        <div className="absolute -inset-0.5 bg-green-500/20 rounded-full blur opacity-50 group-hover:opacity-100 transition duration-500"></div>
                    )}
                    
                    {/* Main Pill Container */}
                    <div className="relative flex items-center gap-4 bg-black/60 backdrop-blur-md border border-white/10 px-6 py-2 rounded-full shadow-xl transition-transform active:scale-95 hover:border-white/30">
                        <div className="flex items-center gap-3">
                            <div className="relative flex h-2.5 w-2.5">
                                {serverStatus.online && <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>}
                                <span className={`relative inline-flex rounded-full h-2.5 w-2.5 ${serverStatus.online ? 'bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.8)]' : 'bg-red-500'}`}></span>
                            </div>
                            <div className="h-4 w-[1px] bg-white/10"></div> {/* Separator */}
                            <span className="font-sans font-bold text-xs tracking-widest text-gray-200 uppercase min-w-[110px] text-center transition-all">
                                {copied ? (
                                    <span className="text-green-400 animate-pulse">IP COPIADO!</span>
                                ) : serverStatus.online ? (
                                    <span className="drop-shadow-sm">{serverStatus.players} <span className="text-gray-500 text-[10px] ml-1">PLAYERS</span></span>
                                ) : (
                                    <span className="text-red-400">OFFLINE</span>
                                )}
                            </span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Auth Modal */}
            {modalMode && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/95 backdrop-blur-sm p-4">
                    <div className="bg-neutral-900 border border-neutral-700 w-full max-w-md p-8 relative shadow-[0_0_40px_rgba(220,20,60,0.1)]">
                        <button 
                            onClick={() => setModalMode(null)}
                            className="absolute top-4 right-4 text-gray-500 hover:text-white transition-colors"
                        >
                            <X size={24} />
                        </button>

                        <h2 className="font-pixel text-crimson text-lg text-center mb-8 uppercase">
                            {modalMode === 'register' ? 'Registrar Treinador' : 'Acesso ao Sistema'}
                        </h2>

                        <form onSubmit={handleSubmit} className="flex flex-col gap-6">
                            <div>
                                <label className="block text-gray-500 text-xs font-pixel mb-2">NICK DO MINECRAFT</label>
                                <input 
                                    type="text" 
                                    value={nick}
                                    onChange={(e) => setNick(e.target.value)}
                                    className="w-full bg-black/50 border border-neutral-700 p-3 text-white font-sans focus:border-crimson focus:outline-none"
                                    placeholder="Seu nick exato..."
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-gray-500 text-xs font-pixel mb-2">SENHA</label>
                                <input 
                                    type="password" 
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="w-full bg-black/50 border border-neutral-700 p-3 text-white font-sans focus:border-crimson focus:outline-none"
                                    placeholder="******"
                                    required
                                />
                            </div>

                            {modalMode === 'register' && (
                                <div>
                                    <input 
                                        type="file" 
                                        ref={fileInputRef} 
                                        className="hidden" 
                                        accept="image/png, image/jpeg" 
                                        onChange={handleFileChange}
                                    />
                                    <div className="flex items-center gap-3">
                                        <button 
                                            type="button"
                                            onClick={() => fileInputRef.current?.click()}
                                            className="text-[10px] text-gray-500 hover:text-white flex items-center gap-1 font-pixel transition-colors"
                                        >
                                            <Upload size={12} /> Importar Skin Manualmente (PNG)
                                        </button>
                                        
                                    </div>
                                    <p className="text-[9px] text-gray-600 mt-1 mb-2">Para jogadores sem conta original. Apenas o rosto será usado.</p>

                                    {customSkin && (
                                        <div className="flex items-center gap-4 bg-black/30 p-2 border border-neutral-800">
                                            <img src={customSkin} alt="Preview" className="w-10 h-10 image-pixelated border border-neutral-600" />
                                            <span className="text-[10px] text-green-500 font-pixel">Skin Processada!</span>
                                        </div>
                                    )}
                                </div>
                            )}

                            {error && <p className="text-red-500 text-xs font-sans text-center">{error}</p>}

                            <button 
                                type="submit"
                                className="w-full bg-crimson text-white font-pixel text-xs py-4 hover:bg-red-700 transition-colors mt-2"
                            >
                                {modalMode === 'register' ? 'CRIAR REGISTRO' : 'ENTRAR'}
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Home;
