import express from 'express';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

// MongoDB Connection - Updated to the specific Cluster0 URI
const MONGO_URI=mongodb+srv://Corazon_user:gUDEULzHoaWp0PGo@cluster0.u8wxlkg.mongodb.net/?appName=Cluster0

mongoose.connect(MONGO_URI)
    .then(() => console.log('✅ Conectado ao MongoDB Atlas (Cluster0)'))
    .catch(err => console.error('❌ Erro no MongoDB:', err));

// CORS middleware manual para permitir conexões
app.use((req, res, next) => {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, Authorization");
    if (req.method === 'OPTIONS') {
        return res.sendStatus(200);
    }
    next();
});

app.use(express.json({ limit: '10mb' }));

// --- SCHEMAS ---

const TrainerSchema = new mongoose.Schema({
    nick: { type: String, required: true, unique: true },
    password: { type: String, required: true },
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

// --- INITIALIZATION ---
const GYM_TYPES = [
    "agua", "dragao", "eletrico", "fada", "fantasma", "fogo", 
    "gelo", "inseto", "lutador", "metalico", "normal", "pedra", 
    "planta", "psiquico", "sombrio", "terra", "venenoso", "voador"
];

const initializeGyms = async () => {
    try {
        const count = await Gym.countDocuments();
        if (count === 0) {
            console.log("⚙️ Criando ginásios...");
            for (const tipo of GYM_TYPES) {
                await Gym.create({
                    tipo,
                    lider: "",
                    time: [null, null, null, null, null, null],
                    challengers: [],
                    activeBattle: null,
                    history: []
                });
            }
        }
    } catch (error) {
        console.error("Erro ao inicializar ginásios:", error);
    }
};
initializeGyms();

// --- API ROUTES ---

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

app.get('/api/gyms', async (req, res) => {
    try {
        const gyms = await Gym.find();
        const gymMap = {};
        gyms.forEach(g => gymMap[g.tipo] = g);
