import express from 'express';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

// 1. Configurações Iniciais
dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware para JSON e limites
app.use(express.json({ limit: '10mb' }));

// Middleware de CORS (Permite conexão do frontend)
app.use((req, res, next) => {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, Authorization");
    if (req.method === 'OPTIONS') {
        return res.sendStatus(200);
    }
    next();
});

// --- SCHEMAS (Modelos do Banco) ---

const TrainerSchema = new mongoose.Schema({
    nick: { type: String, required: true, unique: true },
    password: { type: String, required: true }, // Em produção, use hash (bcrypt)!
    customSkin: String,
    insignias: [String],
    createdAt: { type: Date, default: Date.now }
});
const Trainer = mongoose.model('Trainer', TrainerSchema);

const GymSchema = new mongoose.Schema({
    tipo: { type: String, required: true, unique: true },
    lider: { type: String, default: "" },
    liderSkin: String,
    time: [Object],
    challengers: [String],
    activeBattle: Object,
    history: [Object]
});
const Gym = mongoose.model('Gym', GymSchema);

// Schemas adicionais (mantidos para integridade)
const TournamentSchema = new mongoose.Schema({
    name: String,
    format: String,
    status: { type: String, default: 'pending' },
    participants: [Object],
    matches: [Object],
    currentRound: { type: Number, default: 0 },
    createdAt: { type: Number, default: Date.now }
});
const Tournament = mongoose.model('Tournament', TournamentSchema);

const InviteSchema = new mongoose.Schema({
    tournamentId: String,
    tournamentName: String,
    fromNick: String,
    toNick: String,
    status: { type: String, default: 'pending' }
});
const Invite = mongoose.model('Invite', InviteSchema);

// --- FUNÇÕES DE INICIALIZAÇÃO ---

const GYM_TYPES = [
    "agua", "dragao", "eletrico", "fada", "fantasma", "fogo", 
    "gelo", "inseto", "lutador", "metalico", "normal", "pedra", 
    "planta", "psiquico", "sombrio", "terra", "venenoso", "voador"
];

// Função para criar os ginásios se eles não existirem
const initializeGyms = async () => {
    try {
        const count = await Gym.countDocuments();
        if (count === 0) {
            console.log("⚙️  Banco vazio detectado. Criando 18 ginásios...");
            const gymsToCreate = GYM_TYPES.map(tipo => ({
                tipo,
                lider: "",
                time: [null, null, null, null, null, null],
                challengers: [],
                activeBattle: null,
                history: []
            }));
            
            await Gym.insertMany(gymsToCreate);
            console.log("✅ Ginásios criados com sucesso!");
        } else {
            console.log(`ℹ️  ${count} ginásios já encontrados no banco.`);
        }
    } catch (error) {
        console.error("❌ Erro fatal ao inicializar ginásios:", error);
        throw error; // Repassa o erro para parar o servidor se falhar
    }
};

// --- ROTAS DA API ---

// Rota de Login
app.post('/api/login', async (req, res) => {
    try {
        const { nick, password } = req.body;
        // Regex para buscar case-insensitive (ignora maiúsculas/minúsculas)
        const trainer = await Trainer.findOne({ nick: { $regex: new RegExp(`^${nick}$`, 'i') } });
        
        if (!trainer) return res.status(404).json({ error: "Usuário não encontrado" });
        if (trainer.password !== password) return res.status(401).json({ error: "Senha incorreta" });
        
        res.json(trainer);
    } catch (e) { res.status(500).json({ error: e.message }); }
});

// Rotas de Treinadores
app.get('/api/trainers', async (req, res) => {
    try {
        const trainers = await Trainer.find();
        res.json(trainers);
    } catch (e) { res.status(500).json({ error: e.message }); }
});

app.post('/api/trainers', async (req, res) => {
    try {
        const { nick, password, customSkin } = req.body;
        const exists = await Trainer.findOne({ nick: { $regex: new RegExp(`^${nick}$`, 'i') } });
        if (exists) return res.status(400).json({ error: "Nick já existe" });

        const newTrainer = new Trainer({ nick, password, customSkin, insignias: [] });
        await newTrainer.save();
        res.json(newTrainer);
    } catch (e) { res.status(500).json({ error: e.message }); }
});

app.delete('/api/trainers/:id', async (req, res) => {
    try {
        await Trainer.findByIdAndDelete(req.params.id);
        res.json({ success: true });
    } catch (e) { res.status(500).json({ error: e.message }); }
});

// Rotas de Insígnias
app.post('/api/insignias', async (req, res) => {
    try {
        const { trainerId, badgeId } = req.body;
        const trainer = await Trainer.findById(trainerId);
        if (!trainer) return res.status(404).json({ error: "Trainer not found" });

        // Lógica de toggle (adicionar ou remover)
        if (trainer.insignias.includes(badgeId)) {
            trainer.insignias = trainer.insignias.filter(b => b !== badgeId);
        } else {
            trainer.insignias.push(badgeId);
        }
        await trainer.save();
        res.json(trainer);
    } catch (e) { res.status(500).json({ error: e.message }); }
});

// Rotas de Ginásios (Corrigida e completada)
app.get('/api/gyms', async (req, res) => {
    try {
        const gyms = await Gym.find();
        
        // Transforma o array em um objeto onde a chave é o tipo do ginásio
        // Isso facilita para o frontend acessar: gyms['fogo'], gyms['agua']
        const gymMap = {};
        gyms.forEach(g => gymMap[g.tipo] = g);
        
        res.json(gymMap);
    } catch (e) { 
        console.error(e);
        res.status(500).json({ error: e.message }); 
    }
});

// --- INICIALIZAÇÃO DO SERVIDOR ---

const startServer = async () => {
    try {
        const mongoUri = process.env.MONGO_URI;
        if (!mongoUri) {
            throw new Error("MONGO_URI não definida no arquivo .env");
        }

        // 1. Conecta ao MongoDB Atlas
        console.log("⏳ Conectando ao MongoDB Cluster0...");
        await mongoose.connect(mongoUri);
        console.log("✅ Conectado ao MongoDB Atlas (Cluster0)");

        // 2. Inicializa os dados (Cache/Ginásios)
        await initializeGyms();

        // 3. Abre a porta do servidor
        app.listen(PORT, () => {
            console.log(`🚀 Servidor Cobblemon rodando na porta ${PORT}`);
            console.log(`📡 Acesse em: http://localhost:${PORT}`);
        });

    } catch (error) {
        console.error("❌ Falha ao iniciar o servidor:", error);
        process.exit(1); // Encerra o processo com erro
    }
};

// Executa a inicialização
startServer();