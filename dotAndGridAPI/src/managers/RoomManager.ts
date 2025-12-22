import { Game } from '../models/Game.js';

export class RoomManager {
    private rooms: Map<string, Game> = new Map();

    createRoom(playerId: string, gridSize: number = 10): string {
        const roomId = Math.random().toString(36).substring(2, 8).toUpperCase();
        const game = new Game(roomId, gridSize);
        game.addPlayer(playerId);
        this.rooms.set(roomId, game);
        return roomId;
    }

    joinRoom(roomId: string, playerId: string): Game | null {
        const game = this.rooms.get(roomId);
        if (!game) return null;

        if (game.addPlayer(playerId)) {
            return game;
        }
        return null; // Room full or error
    }

    getGame(roomId: string): Game | undefined {
        return this.rooms.get(roomId);
    }

    removeRoom(roomId: string) {
        this.rooms.delete(roomId);
    }
}
