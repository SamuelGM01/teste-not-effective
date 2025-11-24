
require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bodyParser = require('body-parser');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 10000;

app.use(cors());
app.use(bodyParser.json({ limit: '50mb' }));

// --- MONGODB CONNECTION ---
// Using the provided connection string. Added 'cobblemon' database name.
const MONGO_URI = "mongodb+srv://Corazon_user:gUDEULzHoaWp0PGo@cluster0.u8wxlkg.mongodb.net/cobblemon?appName=Cluster0";

mongoose.connect(MONGO_URI)
    .then(() => console.log('✅ Connected to MongoDB Atlas'))
    .catch(err => console.error('❌ MongoDB Connection Error:', err));

// --- SCHEMAS ---
const TrainerSchema = new mongoose.Schema({
    nick: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    customSkin: String,
    insignias: [String],
    createdAt: { type: Date, default: Date.now }
});

const GymSchema = new mongoose.Schema({
    tipo: { type: String, required: true, unique: true },
    lider: { type: String, default: "" },
    liderSkin: String,
    time: [Object]
});

const TournamentSchema = new mongoose.Schema({
    name: String,
    format: String,
    status: { type: String, default: 'pending' },
    participants: [Object],
    matches: [Object],
    currentRound: { type: Number, default: 0 },
    createdAt: { type: Number, default: Date.now }
});

const InviteSchema = new mongoose.Schema({
    tournamentId: String,
    tournamentName: String,
    fromNick: String,
    toNick: String,
    status: { type: String, default: 'pending' }
});

const Trainer = mongoose.model('Trainer', TrainerSchema);
const Gym = mongoose.model('Gym', GymSchema);
const Tournament = mongoose.model('Tournament', TournamentSchema);
const Invite = mongoose.model('Invite', InviteSchema);

const GYM_TYPES = [
    "agua", "dragao", "eletrico", "fada", "fantasma", "fogo", 
    "gelo", "inseto", "lutador", "metalico", "normal", "pedra", 
    "planta", "psiquico", "sombrio", "terra", "venenoso", "voador"
];

async function initGyms() {
    try {
        const count = await Gym.countDocuments();
        if (count === 0) {
            console.log("Creating initial gyms...");
            for (const type of GYM_TYPES) {
                await Gym.create({ tipo: type, lider: "", time: [null,null,null,null,null,null] });
            }
        }
    } catch (e) {
        console.error("Error initializing gyms:", e);
    }
}
initGyms();

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
        if (exists) return res.status(400).json({ error: "Nick already exists" });
        
        const newTrainer = new Trainer({ nick, password, customSkin, insignias: [] });
        await newTrainer.save();
        res.json(newTrainer);
    } catch (e) { res.status(500).json({ error: e.message }); }
});

app.post('/api/login', async (req, res) => {
    try {
        const { nick, password } = req.body;
        const trainer = await Trainer.findOne({ nick: { $regex: new RegExp(`^${nick}$`, 'i') } });
        if (!trainer || trainer.password !== password) {
            return res.status(401).json({ error: "Invalid credentials" });
        }
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
        const { trainerId, insigniaId } = req.body;
        const trainer = await Trainer.findById(trainerId);
        if (!trainer) return res.status(404).json({ error: "Trainer not found" });

        if (trainer.insignias.includes(insigniaId)) {
            trainer.insignias = trainer.insignias.filter(id => id !== insigniaId);
        } else {
            trainer.insignias.push(insigniaId);
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
        res.json(gymMap);
    } catch (e) { res.status(500).json({ error: e.message }); }
});

app.post('/api/gyms/update', async (req, res) => {
    try {
        const { tipo, lider, liderSkin, time } = req.body;
        await Gym.findOneAndUpdate({ tipo }, { lider, liderSkin, time });
        res.json({ success: true });
    } catch (e) { res.status(500).json({ error: e.message }); }
});

app.post('/api/gyms/reset', async (req, res) => {
    try {
        const { tipo } = req.body;
        await Gym.findOneAndUpdate({ tipo }, { lider: "", liderSkin: null, time: [null,null,null,null,null,null] });
        res.json({ success: true });
    } catch (e) { res.status(500).json({ error: e.message }); }
});

app.get('/api/tournaments', async (req, res) => {
    try {
        const tournaments = await Tournament.find();
        res.json(tournaments);
    } catch (e) { res.status(500).json({ error: e.message }); }
});

app.post('/api/tournaments', async (req, res) => {
    try {
        const { name, format } = req.body;
        const t = new Tournament({ name, format, participants: [], matches: [] });
        await t.save();
        res.json(t);
    } catch (e) { res.status(500).json({ error: e.message }); }
});

app.post('/api/tournaments/:id/update', async (req, res) => {
    try {
        const { participants, matches, status, currentRound } = req.body;
        const updateData = {};
        if (participants) updateData.participants = participants;
        if (matches) updateData.matches = matches;
        if (status) updateData.status = status;
        if (currentRound) updateData.currentRound = currentRound;
        
        await Tournament.findByIdAndUpdate(req.params.id, updateData);
        res.json({ success: true });
    } catch (e) { res.status(500).json({ error: e.message }); }
});

app.get('/api/invites/:nick', async (req, res) => {
    try {
        const invites = await Invite.find({ toNick: { $regex: new RegExp(`^${req.params.nick}$`, 'i') }, status: 'pending' });
        res.json(invites);
    } catch (e) { res.status(500).json({ error: e.message }); }
});

app.post('/api/invites', async (req, res) => {
    try {
        const { tournamentId, tournamentName, fromNick, toNick } = req.body;
        const existing = await Invite.findOne({ tournamentId, fromNick, toNick, status: 'pending' });
        if (existing) return res.status(400).json({ error: "Invite already sent" });

        const invite = new Invite({ tournamentId, tournamentName, fromNick, toNick });
        await invite.save();
        res.json(invite);
    } catch (e) { res.status(500).json({ error: e.message }); }
});

app.post('/api/invites/:id/respond', async (req, res) => {
    try {
        const { accept } = req.body;
        const invite = await Invite.findByIdAndUpdate(req.params.id, { status: accept ? 'accepted' : 'rejected' }, { new: true });
        
        if (accept && invite) {
            const tournament = await Tournament.findById(invite.tournamentId);
            if (tournament) {
                const p1Index = tournament.participants.findIndex(p => p.nick === invite.fromNick);
                const p2Index = tournament.participants.findIndex(p => p.nick === invite.toNick);
                
                if (p1Index !== -1 && p2Index !== -1) {
                    const p1 = tournament.participants[p1Index];
                    const p2 = tournament.participants[p2Index];
                    
                    // Link them
                    p1.partnerId = p2.trainerId;
                    p1.partnerNick = p2.nick;
                    p2.partnerId = p1.trainerId;
                    p2.partnerNick = p1.nick;
                    
                    // Mongoose mixed array update requires marking modified
                    tournament.markModified('participants');
                    await tournament.save();
                }
            }
        }
        res.json({ success: true });
    } catch (e) { res.status(500).json({ error: e.message }); }
});

// --- SERVE REACT FRONTEND (MUST BE LAST) ---
app.use(express.static(path.join(__dirname, 'dist')));

app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
});
