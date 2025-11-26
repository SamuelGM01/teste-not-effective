
import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import https from 'https';

dotenv.config();

// Recreate __dirname for ES Modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

// MongoDB Connection
const MONGO_URI = process.env.MONGO_URI || "mongodb+srv://Corazon_user:gUDEULzHoaWp0PGo@cluster0.u8wxlkg.mongodb.net/cobblemon?retryWrites=true&w=majority&appName=Cluster0";

mongoose.connect(MONGO_URI)
    .then(() => console.log('✅ Conectado ao MongoDB Atlas'))
    .catch(err => console.error('❌ Erro no MongoDB:', err));

app.use(cors());
app.use(express.json({ limit: '10mb' })); // Replaces body-parser

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
    activeBattle: Object, // GymBattle { id, challengerNick, date, time, status, result }
    history: [Object] // Array of GymBattle
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

// New route for server status proxy
app.get('/api/server-status', (req, res) => {
    const options = {
        hostname: 'api.mcstatus.io',
        port: 443,
        path: '/v2/status/java/jasper.lura.host:35570',
        method: 'GET',
        headers: { 'User-Agent': 'Node.js-Server-Proxy' }
    };

    const apiReq = https.request(options, apiRes => {
        let data = '';
        apiRes.on('data', chunk => {
            data += chunk;
        });
        apiRes.on('end', () => {
            if (apiRes.statusCode >= 200 && apiRes.statusCode < 300) {
                try {
                    const jsonData = JSON.parse(data);
                    res.json(jsonData);
                } catch (e) {
                    res.status(500).json({ online: false, players: { online: 0 } });
                }
            } else {
                 res.status(apiRes.statusCode).json({ online: false, players: { online: 0 } });
            }
        });
    });

    apiReq.on('error', error => {
        console.error('Error fetching server status:', error);
        res.status(500).json({ online: false, players: { online: 0 } });
    });

    apiReq.end();
});

// 3. Tournaments
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

app.post('/api/tournaments/:id/join', async (req, res) => {
    try {
        const { trainerId, nick, customSkin, pokemon, gymType } = req.body;
        const t = await Tournament.findById(req.params.id);
        if (!t) return res.status(404).json({ error: "Torneio não encontrado" });

        if (t.participants.some(p => p.trainerId === trainerId)) {
            return res.status(400).json({ error: "Já inscrito" });
        }

        t.participants.push({ trainerId, nick, customSkin, pokemon, gymType });
        t.markModified('participants');
        await t.save();
        res.json(t);
    } catch (e) { res.status(500).json({ error: e.message }); }
});

app.post('/api/tournaments/:id/leave', async (req, res) => {
    try {
        const { trainerId } = req.body;
        const t = await Tournament.findById(req.params.id);
        if (!t) return res.status(404).json({ error: "Torneio não encontrado" });

        const me = t.participants.find(p => p.trainerId === trainerId);
        if (me && me.partnerId) {
            const partner = t.participants.find(p => p.trainerId === me.partnerId);
            if (partner) {
                partner.partnerId = undefined;
                partner.partnerNick = undefined;
            }
        }

        t.participants = t.participants.filter(p => p.trainerId !== trainerId);
        t.markModified('participants');
        await t.save();
        res.json({ success: true });
    } catch (e) { res.status(500).json({ error: e.message }); }
});

app.post('/api/tournaments/:id/start', async (req, res) => {
    try {
        const t = await Tournament.findById(req.params.id);
        if (!t) return res.status(404).json({ error: "Torneio não encontrado" });

        const count = t.participants.length;
        if (count % 2 !== 0) return res.status(400).json({ error: "Número ímpar de jogadores" });

        const shuffled = [...t.participants].sort(() => Math.random() - 0.5);
        const newMatches = [];
        const generateId = () => Math.random().toString(36).substr(2, 9);

        if (t.format === 'monotype') {
            for (let i = 0; i < shuffled.length; i += 2) {
                newMatches.push({
                    id: generateId(),
                    round: 1,
                    participants: [shuffled[i], shuffled[i+1]],
                    winners: [],
                    bans: {}
                });
            }
        } else {
            const pairs = [];
            const processedIds = new Set();
            for (const p of shuffled) {
                if (processedIds.has(p.trainerId)) continue;
                const partner = shuffled.find(s => s.trainerId === p.partnerId);
                if (partner) {
                    pairs.push([p, partner]);
                    processedIds.add(p.trainerId);
                    processedIds.add(partner.trainerId);
                }
            }
            for (let i = 0; i < pairs.length; i += 2) {
                if (i+1 < pairs.length) {
                    newMatches.push({
                        id: generateId(),
                        round: 1,
                        participants: [...pairs[i], ...pairs[i+1]],
                        winners: [],
                        bans: {}
                    });
                }
            }
        }

        t.status = 'active';
        t.currentRound = 1;
        t.matches = newMatches;
        t.markModified('matches');
        await t.save();
        res.json(t);
    } catch (e) { res.status(500).json({ error: e.message }); }
});

app.post('/api/tournaments/:id/matches/:matchId/win', async (req, res) => {
    try {
        const { winners } = req.body;
        const t = await Tournament.findById(req.params.id);
        const match = t.matches.find(m => m.id === req.params.matchId);
        if (!match) return res.status(404).json({ error: "Partida não encontrada" });

        match.winners = winners;
        
        const roundMatches = t.matches.filter(m => m.round === t.currentRound);
        const allFinished = roundMatches.every(m => m.winners && m.winners.length > 0);

        if (allFinished) {
            const winnersIds = roundMatches.flatMap(m => m.winners);
            const isOver = t.format === 'monotype' ? winnersIds.length === 1 : winnersIds.length === 2;

            if (isOver) {
                t.status = 'completed';
            } else {
                t.currentRound += 1;
                const nextParticipants = t.participants.filter(p => winnersIds.includes(p.trainerId));
                const shuffled = nextParticipants.sort(() => Math.random() - 0.5);
                const generateId = () => Math.random().toString(36).substr(2, 9);

                if (t.format === 'monotype') {
                    for (let i = 0; i < shuffled.length; i += 2) {
                        if (i+1 < shuffled.length) {
                            t.matches.push({ id: generateId(), round: t.currentRound, participants: [shuffled[i], shuffled[i+1]], winners: [], bans: {} });
                        } else {
                            t.matches.push({ id: generateId(), round: t.currentRound, participants: [shuffled[i]], winners: [shuffled[i].trainerId], bans: {} });
                        }
                    }
                } else {
                    const teams = [];
                    const processedIds = new Set();
                    for (const p of shuffled) {
                        if (processedIds.has(p.trainerId)) continue;
                        const partner = shuffled.find(s => s.trainerId === p.partnerId);
                        if (partner) {
                            teams.push([p, partner]);
                            processedIds.add(p.trainerId);
                            processedIds.add(partner.trainerId);
                        }
                    }
                    for (let i = 0; i < teams.length; i += 2) {
                        if (i+1 < teams.length) {
                            t.matches.push({ id: generateId(), round: t.currentRound, participants: [...teams[i], ...teams[i+1]], winners: [], bans: {} });
                        } else {
                            t.matches.push({ id: generateId(), round: t.currentRound, participants: [...teams[i]], winners: teams[i].map(x=>x.trainerId), bans: {} });
                        }
                    }
                }
            }
        }

        t.markModified('matches');
        await t.save();
        res.json(t);
    } catch (e) { res.status(500).json({ error: e.message }); }
});

app.post('/api/tournaments/:id/matches/:matchId/ban', async (req, res) => {
    try {
        const { targetTrainerId, pokemonName } = req.body;
        const t = await Tournament.findById(req.params.id);
        const match = t.matches.find(m => m.id === req.params.matchId);
        
        if (!match.bans) match.bans = {};
        if (!match.bans[targetTrainerId]) match.bans[targetTrainerId] = [];

        const bans = match.bans[targetTrainerId];
        if (bans.includes(pokemonName)) {
            match.bans[targetTrainerId] = bans.filter(n => n !== pokemonName);
        } else {
            match.bans[targetTrainerId].push(pokemonName);
        }

        t.markModified('matches');
        await t.save();
        res.json({ success: true });
    } catch (e) { res.status(500).json({ error: e.message }); }
});

// 4. Invites
app.get('/api/invites', async (req, res) => {
    try {
        const { nick } = req.query;
        const invites = await Invite.find({ toNick: { $regex: new RegExp(`^${nick}$`, 'i') }, status: 'pending' });
        res.json(invites);
    } catch (e) { res.status(500).json({ error: e.message }); }
});

app.post('/api/invites', async (req, res) => {
    try {
        const { tournamentId, tournamentName, fromNick, toNick } = req.body;
        const exists = await Invite.findOne({ tournamentId, fromNick, toNick, status: 'pending' });
        if (exists) return res.status(400).json({ error: "Convite já enviado" });

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
                    
                    p1.partnerId = p2.trainerId;
                    p1.partnerNick = p2.nick;
                    p2.partnerId = p1.trainerId;
                    p2.partnerNick = p1.nick;
                    
                    tournament.markModified('participants');
                    await tournament.save();
                }
            }
        }
        res.json({ success: true });
    } catch (e) { res.status(500).json({ error: e.message }); }
});

// --- SERVE REACT FRONTEND ---
// Serve static files from the root directory which contains index.html and other assets.
app.use(express.static(__dirname));

// The "catchall" handler: for any request that doesn't match one of the API routes above,
// send back React's index.html file. This is required for single-page applications.
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});


app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
});
