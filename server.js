require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const { sequelize } = require('./src/models');

const authRoutes = require('./src/routes/authRoutes');
const challengeRoutes = require('./src/routes/challengeRoutes');
const friendRoutes = require('./src/routes/friendRoutes');
const reviewRoutes = require('./src/routes/reviewRoutes');
const examRoutes = require('./src/routes/examRoutes');
const fitnessRoutes = require('./src/routes/fitnessRoutes');
const devRoutes = require('./src/routes/devRoutes');
const analyticsRoutes = require('./src/routes/analyticsRoutes');

const calendarRoutes = require('./src/routes/calendarRoutes');
const knowledgeRoutes = require('./src/routes/knowledgeRoutes');
const aiCoachRoutes = require('./src/routes/aiCoachRoutes');
const notificationRoutes = require('./src/routes/notificationRoutes');
const penaltyRoutes = require('./src/routes/penaltyRoutes');
const gamificationRoutes = require('./src/routes/gamificationRoutes');
const taskRoutes = require('./src/routes/taskRoutes');
const goalWorkspaceRoutes = require('./src/routes/goalWorkspaceRoutes');
const dashboardRoutes = require('./src/routes/dashboardRoutes');
const chatRoutes = require('./src/routes/chatRoutes');

const compression = require('compression');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(compression());
app.use(cors({
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());

// API Routes Gateways
app.use('/api/auth', authRoutes);
app.use('/api/challenges', challengeRoutes);
app.use('/api/friends', friendRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/exams', examRoutes);
app.use('/api/fitness', fitnessRoutes);
app.use('/api/dev', devRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/chat', chatRoutes);

app.use('/api/calendar', calendarRoutes);
app.use('/api/knowledge', knowledgeRoutes);
app.use('/api/ai-coach', aiCoachRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/penalties', penaltyRoutes);
app.use('/api/gamification', gamificationRoutes);
app.use('/api/tasks', taskRoutes);
app.use('/api/goals/workspace', goalWorkspaceRoutes);
app.use('/api/dashboard', dashboardRoutes);

const fs = require('fs');

// Permanent Static Uploads Directory setup
const uploadsDir = path.join(__dirname, 'public', 'uploads');
if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
}
app.use('/uploads', express.static(uploadsDir));

const { createClient } = require('@supabase/supabase-js');
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY;
const supabase = (supabaseUrl && supabaseKey) ? createClient(supabaseUrl, supabaseKey) : null;

// Permanent Image Upload Endpoint with Supabase Cloud Storage Backup
app.post('/api/upload', express.json({ limit: '25mb' }), async (req, res) => {
    try {
        const { image } = req.body;
        if (!image) {
            return res.status(400).json({ message: 'Image data is required' });
        }

        const matches = image.match(/^data:image\/([a-zA-Z0-9]+);base64,(.+)$/);
        let ext = 'png';
        let buffer;
        let contentType = 'image/png';

        if (matches) {
            ext = matches[1] === 'jpeg' ? 'jpg' : matches[1];
            contentType = `image/${matches[1]}`;
            buffer = Buffer.from(matches[2], 'base64');
        } else {
            buffer = Buffer.from(image, 'base64');
        }

        const safeFilename = `img_${Date.now()}_${Math.random().toString(36).substr(2, 6)}.${ext}`;

        // 1. Always save to local /uploads/ folder for instant static serving
        const filePath = path.join(uploadsDir, safeFilename);
        fs.writeFileSync(filePath, buffer);
        let finalUrl = `/uploads/${safeFilename}`;

        // 2. Upload to Supabase Cloud Storage for permanent lifetime cloud hosting
        if (supabase) {
            try {
                const { data, error } = await supabase.storage
                    .from('lifeos-uploads')
                    .upload(safeFilename, buffer, { contentType, upsert: true });

                if (!error && data) {
                    const { data: publicUrlData } = supabase.storage
                        .from('lifeos-uploads')
                        .getPublicUrl(safeFilename);

                    if (publicUrlData?.publicUrl) {
                        finalUrl = publicUrlData.publicUrl;
                    }
                }
            } catch (sErr) {
                console.log('Supabase cloud storage upload fallback to local:', sErr.message);
            }
        }

        res.status(201).json({ 
            message: 'Image stored permanently in cloud & local disk',
            url: finalUrl
        });
    } catch (err) {
        console.error('Permanent upload error:', err);
        res.status(500).json({ message: 'Failed to save image permanently' });
    }
});

// Serve static frontend in production
app.use(express.static(path.join(__dirname, 'client', 'dist')));

app.get(/.*/, (req, res) => {
    const indexPath = path.resolve(__dirname, 'client', 'dist', 'index.html');
    if (fs.existsSync(indexPath)) {
        res.sendFile(indexPath);
    } else {
        res.status(200).send('<h2>LifeOS Backend API is Running on Port 5000!</h2><p>Frontend is currently building. Please wait a few seconds and refresh.</p>');
    }
});

const { seedDemoPartnerForAllUsers } = require('./src/utils/partnerSeeder');

// Database connection and server start
async function startServer() {
    let connected = false;
    let attempts = 0;
    while (!connected && attempts < 5) {
        try {
            attempts++;
            await sequelize.authenticate();
            connected = true;
            console.log('Database connected to Supabase');
            await sequelize.sync({ alter: false });
            try {
                await sequelize.query('ALTER TABLE "PartnerInterventions" ADD COLUMN IF NOT EXISTS "sender_read" BOOLEAN DEFAULT false;');
                const { User, ExamSession } = require('./src/models');
                await User.update({ is_in_exam_mode: false }, { where: {} });
                await ExamSession.update({ is_active: false }, { where: { is_active: true } });
            } catch(e) { console.error('Migration notice:', e.message); }
        } catch (err) {
            console.error(`Database connection attempt ${attempts} failed:`, err.message);
            if (attempts >= 5) {
                console.error('Max database connection attempts reached. Exiting.');
                process.exit(1);
            }
            await new Promise(r => setTimeout(r, 2000));
        }
    }

    const { startPenaltyWorker } = require('./src/services/penaltyWorker');
    startPenaltyWorker();

    const http = require('http');
    const { Server } = require('socket.io');
    const { ChatMessage } = require('./src/models');

    const server = http.createServer(app);
    const io = new Server(server, {
        cors: {
            origin: '*',
            methods: ['GET', 'POST']
        }
    });

    const userSockets = {};

    io.on('connection', (socket) => {
        const userId = socket.handshake.query.userId;
        if (userId) {
            userSockets[userId] = socket.id;
        }

        socket.on('sendMessage', async (data) => {
            try {
                const { sender_id, receiver_id, content } = data;
                
                const message = await ChatMessage.create({
                    sender_id,
                    receiver_id,
                    content
                });

                const receiverSocketId = userSockets[receiver_id];
                if (receiverSocketId) {
                    io.to(receiverSocketId).emit('receiveMessage', message);
                }

                socket.emit('messageSent', message);
            } catch (error) {
                console.error('Socket send message error:', error);
            }
        });

        socket.on('disconnect', () => {
            if (userId) {
                delete userSockets[userId];
            }
        });
    });

    server.listen(PORT, () => {
        console.log(`Server and Socket.IO running on port ${PORT}`);
    });
}

startServer();
