import express from 'express';
import http from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import { RoomManager } from './managers/RoomManager.js';

const app = express();
app.use(cors());

const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: "*", // Allow all for now, lock down in prod
        methods: ["GET", "POST"]
    }
});

const roomManager = new RoomManager();

io.on('connection', (socket) => {
    console.log('User connected:', socket.id);

    socket.on('create_room', ({ gridSize }, callback) => {
        const roomId = roomManager.createRoom(socket.id, gridSize);
        socket.join(roomId);
        callback({ roomId });
        console.log(`Room created: ${roomId} by ${socket.id}`);
    });

    socket.on('join_room', ({ roomId }, callback) => {
        const game = roomManager.joinRoom(roomId, socket.id);
        if (game) {
            socket.join(roomId);
            callback({ success: true, gameState: game.getState() });
            io.to(roomId).emit('game_update', game.getState());
            console.log(`User ${socket.id} joined room ${roomId}`);
        } else {
            callback({ success: false, error: 'Room not found or full' });
        }
    });

    socket.on('make_move', ({ roomId, edge }) => {
        const game = roomManager.getGame(roomId);
        if (!game) return;

        const result = game.makeMove(socket.id, edge);
        if (result.valid) {
            io.to(roomId).emit('game_update', game.getState());
        } else {
            socket.emit('move_error', { error: result.error });
        }
    });

    socket.on('disconnect', () => {
        console.log('User disconnected:', socket.id);
        // Handle player disconnect (optional: auto-forfeit or wait)
        // For now, simplify: we don't strictly destroy the room immediately to allow reconnects if we had logic for it,
        // but currently Game.ts doesn't handle re-association.
    });
});

const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
