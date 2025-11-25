import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { v4 as uuidv4 } from 'uuid';

dotenv.config();

// Recreate __dirname for ES Modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

// CORRECTED MongoDB Connection String
const MONGO_URI = "mongodb+srv://Corazon_user:gUDEULzHoaWp0PGo@cluster0.u8wxlkg.mongodb.net/cobblemon?appName=Cluster0";

mongoose.connect(MONGO_URI)
    .then(() => console.log('✅ Conectado ao MongoDB Atlas'))
    .catch(err => console.error('❌ Erro no MongoDB:', err));

app.use(cors());
app.use(express.json({ limit: '10mb' })); // Replaces body-parser

// --- SCHEMA OPTIONS TO STANDARDIZE IDs ---
const schemaOptions = {
  toJSON: { virtuals: true }, // Inclui 'id' virtual quando o documento é convertido para JSON
  toObject: { virtuals: true },
  id: true, // Garante que o virtual 'id' seja criado
  _id: true // Mantém o _id original
};

// --- SCHEMAS ---

const TrainerSchema = new mongoose.Schema({
    // _id será gerado automaticamente pelo Mongoose
    nick: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    customSkin: String,
    insignias: [String],
    createdAt: { type: Date, default: Date.now }
}, schemaOptions);
const Trainer = mongoose.model('Trainer', TrainerSchema);

const GymSchema = new mongoose.Schema({
    tipo: { type: String, required: true, unique: true },
    lider: { type: String, default: "" },
    liderSkin: String,
    time: [Object],
    challengers: [String],
    activeBattle: Object, 
    history: [Object] 
}, schemaOptions);
const Gym = mongoose.model('Gym', GymSchema);

const TournamentSchema = new mongoose.Schema({
    name: String,
    format: String,
    status: { type: String, default: 'pending' },
    participants: [Object],
    matches: [Object],
    currentRound: { type: Number, default: 0 },
    createdAt: { type: Number, default: Date.now }
}, schemaOptions);
const Tournament = mongoose.model('Tournament', TournamentSchema);

const InviteSchema = new mongoose.Schema({
    tournamentId: String,
    tournamentName: String,
    fromNick: String,
    toNick: String,
    status: { type: String, default: 'pending' }
}, schemaOptions);
const Invite = mongoose.model('Invite', InviteSchema);

// --- INITIALIZATION ---
const GYM_TYPES = [
    "agua", "dragao", "eletrico", "fada", "fantasma", "fogo", 
    "gelo", "inseto", "lutador", "metalico", "normal", "pedra", 
    "planta", "psiquico", "sombrio", "terra", "venenoso", "voador"
];

const initializeGyms = async () => {
    try {
        for (const tipo of GYM_TYPES) {
            await Gym.updateOne(
                { tipo: tipo },
                { $setOnInsert: { 
                    tipo: tipo,
                    lider: "",
                    time: [null, null, null, null, null, null],
                    challengers: [],
                    activeBattle: null,
                    history: []
                }},
                { upsert: true }
            );
        }
        console.log("✅ Ginásios verificados/inicializados.");
    } catch (error) {
        console.error("Erro ao inicializar ginásios:", error);
    }
};
initializeGyms();

// --- API ROUTES (all routes now return 'id' automatically) ---

// 1. Trainers
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

app.post('/api/login', async (req, res) => {
    try {
        const { nick, password } = req.body;
        const trainer = await Trainer.findOne({ nick: { $regex: new RegExp(`^${nick}$`, 'i') } });
        if (!trainer) return res.status(404).json({ error: "Usuário não encontrado" });
        if (trainer.password !== password) return res.status(401).json({ error: "Senha incorreta" });
        res.json(trainer);
    } catch (e) { res.status(500).json({ error: e.message }); }
});

app.delete('/api/trainers/:id', async (req, res) => {
    try {
        await Trainer.findByIdAndDelete(req.params.id);
        res.json({ success: true });
    } catch (e) { res.status(500).json({ error: e.message }); }
});

app.post('/api/insignias', async (req, res) => {
    try {
        const { trainerId, badgeId } = req.body;
        const trainer = await Trainer.findById(trainerId);
        if (!trainer) return res.status(404).json({ error: "Trainer not found" });

        if (trainer.insignias.includes(badgeId)) {
            trainer.insignias = trainer.insignias.filter(b => b !== badgeId);
        } else {
            trainer.insignias.push(badgeId);
        }
        await trainer.save();
        res.json(trainer);
    } catch (e) { res.status(500).json({ error: e.message }); }
});

// 2. Gyms
app.get('/api/gyms', async (req, res) => {
    try {
        const gyms = await Gym.find();
        const gymMap = {};
        gyms.forEach(g => gymMap[g.tipo] = g);
        res.json(gymMap);
    } catch (e) { res.status(500).json({ error: e.message }); }
});

app.post('/api/gyms', async (req, res) => {
    try {
        const { tipo, lider, time, liderSkin } = req.body;
        await Gym.findOneAndUpdate(
            { tipo }, 
            { lider, time, liderSkin }, 
            { upsert: true }
        );
        res.json({ success: true });
    } catch (e) { res.status(500).json({ error: e.message }); }
});

app.post('/api/gyms/reset', async (req, res) => {
    try {
        const { tipo } = req.body;
        await Gym.findOneAndUpdate(
            { tipo }, 
            { 
                lider: "", 
                liderSkin: null, 
                time: [null,null,null,null,null,null], 
                challengers: [],
                activeBattle: null,
                history: []
            }
        );
        res.json({ success: true });
    } catch (e) { res.status(500).json({ error: e.message }); }
});

app.post('/api/gyms/:tipo/challenge', async (req, res) => {
    try {
        const { tipo } = req.params;
        const { nick } = req.body;
        
        const gym = await Gym.findOne({ tipo });
        if (!gym) return res.status(404).json({ error: "Ginásio não encontrado" });

        if (!gym.challengers) gym.challengers = [];

        if (gym.challengers.includes(nick)) {
            gym.challengers = gym.challengers.filter(c => c !== nick);
        } else {
            gym.challengers.push(nick);
        }
        
        await gym.save();
        res.json({ success: true, challengers: gym.challengers });
    } catch (e) { res.status(500).json({ error: e.message }); }
});

app.post('/api/gyms/:tipo/battle/accept', async (req, res) => {
    try {
        const { tipo } = req.params;
        const { challengerNick, date, time } = req.body;
        const gym = await Gym.findOne({ tipo });
        if (!gym) return res.status(404).json({ error: "Ginásio não encontrado" });

        gym.challengers = gym.challengers.filter(c => c !== challengerNick);
        gym.activeBattle = { id: uuidv4(), challengerNick, date, time, status: 'scheduled' };
        
        await gym.save();
        res.json({ success: true });
    } catch (e) { res.status(500).json({ error: e.message }); }
});

app.post('/api/gyms/:tipo/battle/resolve', async (req, res) => {
    try {
        const { tipo } = req.params;
        const { result } = req.body;
        const gym = await Gym.findOne({ tipo });
        if (!gym || !gym.activeBattle) return res.status(404).json({ error: "Batalha ativa não encontrada" });

        const battle = { ...gym.activeBattle, status: 'completed', result };
        if (!gym.history) gym.history = [];
        gym.history.unshift(battle);
        gym.activeBattle = null;
        
        await gym.save();
        res.json({ success: true });
    } catch (e) { res.status(500).json({ error: e.message }); }
});

// 3. Tournaments (Remaining routes are omitted for brevity, but should be here)
// ...

// --- SERVE REACT FRONTEND ---
app.use(express.static(path.join(__dirname, 'dist')));

app.get(/.*/, (req, res) => {
    res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
});