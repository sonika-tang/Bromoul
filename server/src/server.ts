
import { createServer } from 'http';
import { app } from './app';
import { Server } from 'socket.io';

const PORT = process.env.PORT || 3000;

const httpServer = createServer(app);

// Initialize Socket.IO
const io = new Server(httpServer, {
    cors: {
        origin: "*",
        methods: ["GET", "POST"]
    }
});

// Socket.io handlers
io.on('connection', (socket) => {
    console.log('User connected:', socket.id);
    socket.on('join', (userId) => {
        socket.join(`user_${userId}`);
    });
    socket.on('send_message', (data) => {
        io.to(`user_${data.receiverId}`).emit('receive_message', data);
    });
    socket.on('disconnect', () => {
        console.log('User disconnected:', socket.id);
    });
});

// Make io available to routes
app.set('io', io);

httpServer.listen(PORT, () => {
    console.log(`🚀 Bromoul Server running on port ${PORT}`);
    console.log(`📡 Health check: http://localhost:${PORT}/api/health`);
});
