import { GameState, Player, MoveResult, Edge, PlayerId } from '../types.js';

export class Game {
    public id: string;
    public players: Player[] = [];
    public gridSize: number;
    public edges: Set<string> = new Set();
    public boxes: { [key: string]: string } = {};
    public scores: { [key: string]: number } = {};
    public currentTurnIndex: number = 0;
    public status: 'waiting' | 'playing' | 'finished' = 'waiting';
    public winner: PlayerId | null = null;

    constructor(id: string, gridSize: number) {
        this.id = id;
        this.gridSize = gridSize;
    }

    addPlayer(playerId: string): boolean {
        // If player already joined, just return true (reconnect/refresh)
        if (this.players.some(p => p.id === playerId)) {
            const player = this.players.find(p => p.id === playerId);
            if (player) player.connected = true;
            return true;
        }

        if (this.players.length >= 2) return false;
        const initials = this.players.length === 0 ? 'P1' : 'P2';
        this.players.push({ id: playerId, initials, connected: true });
        this.scores[playerId] = 0;

        if (this.players.length === 2) {
            this.status = 'playing';
            this.currentTurnIndex = 0; // P1 starts
        }
        return true;
    }

    removePlayer(playerId: string) {
        this.players = this.players.filter(p => p.id !== playerId);
        if (this.status === 'playing') {
            this.status = 'finished'; // Opponent wins by default or game aborts
            // Simple handling: if playing and someone leaves, game over
        } else {
            this.status = 'waiting';
        }
    }

    makeMove(playerId: string, edge: Edge): MoveResult {
        if (this.status !== 'playing') return { valid: false, error: 'Game not active' };
        if (this.players[this.currentTurnIndex].id !== playerId) return { valid: false, error: 'Not your turn' };

        // Normalize edge (smaller coordinates first to ensure consistency)
        // Ensure x1,y1 is top-left/smaller than x2,y2
        let { x1, y1, x2, y2 } = edge;
        if (x1 > x2 || (x1 === x2 && y1 > y2)) {
            [x1, x2] = [x2, x1];
            [y1, y2] = [y2, y1];
        }

        const edgeKey = `${x1},${y1}-${x2},${y2}`;
        if (this.edges.has(edgeKey)) return { valid: false, error: 'Edge already exists' };

        // Validate adjacency
        const isHorizontal = y1 === y2 && Math.abs(x1 - x2) === 1;
        const isVertical = x1 === x2 && Math.abs(y1 - y2) === 1;
        if (!isHorizontal && !isVertical) return { valid: false, error: 'Invalid edge length' };

        // Add edge
        this.edges.add(edgeKey);

        // Check for completed boxes
        const completedBoxes = this.checkCompletedBoxes(edge, playerId);

        if (completedBoxes > 0) {
            this.scores[playerId] += completedBoxes;
            // Player keeps turn
        } else {
            this.currentTurnIndex = (this.currentTurnIndex + 1) % 2;
        }

        this.checkWinCondition();

        return {
            valid: true,
            completedBoxes,
            nextTurn: this.players[this.currentTurnIndex].id
        };
    }

    private checkCompletedBoxes(newEdge: Edge, playerId: string): number {
        let count = 0;
        // Normalize new edge
        let { x1, y1, x2, y2 } = newEdge;
        if (x1 > x2 || (x1 === x2 && y1 > y2)) {
            [x1, x2] = [x2, x1];
            [y1, y2] = [y2, y1];
        }

        // Horizontal edge (x, y) -> (x+1, y)
        if (y1 === y2) {
            // Check box above: (x, y-1) top-left
            if (this.isBoxComplete(x1, y1 - 1)) {
                this.boxes[`${x1},${y1 - 1}`] = playerId;
                count++;
            }
            // Check box below: (x, y) top-left
            if (this.isBoxComplete(x1, y1)) {
                this.boxes[`${x1},${y1}`] = playerId;
                count++;
            }
        }
        // Vertical edge (x, y) -> (x, y+1)
        else {
            // Check box left: (x-1, y) top-left
            if (this.isBoxComplete(x1 - 1, y1)) {
                this.boxes[`${x1 - 1},${y1}`] = playerId;
                count++;
            }
            // Check box right: (x, y) top-left
            if (this.isBoxComplete(x1, y1)) {
                this.boxes[`${x1},${y1}`] = playerId;
                count++;
            }
        }
        return count;
    }

    // Check if box at top-left (x,y) is complete
    // Box consists of edges:
    // Top: (x,y)-(x+1,y)
    // Bottom: (x,y+1)-(x+1,y+1)
    // Left: (x,y)-(x,y+1)
    // Right: (x+1,y)-(x+1,y+1)
    private isBoxComplete(x: number, y: number): boolean {
        // Boundary check (assuming 0-indexed dots)
        // Grid size N dots means N-1 boxes width/height
        if (x < 0 || y < 0 || x >= this.gridSize - 1 || y >= this.gridSize - 1) return false;

        const top = `${x},${y}-${x + 1},${y}`;
        const bottom = `${x},${y + 1}-${x + 1},${y + 1}`;
        const left = `${x},${y}-${x},${y + 1}`;
        const right = `${x + 1},${y}-${x + 1},${y + 1}`;

        return this.edges.has(top) &&
            this.edges.has(bottom) &&
            this.edges.has(left) &&
            this.edges.has(right);
    }

    private checkWinCondition() {
        // Total possible edges or boxes?
        // Easier: Total boxes = (gridSize-1)^2
        const totalBoxes = (this.gridSize - 1) * (this.gridSize - 1);
        const claimedBoxes = Object.keys(this.boxes).length;

        if (claimedBoxes >= totalBoxes) {
            this.status = 'finished';
            const ids = this.players.map(p => p.id);
            if (this.scores[ids[0]] > this.scores[ids[1]]) {
                this.winner = ids[0];
            } else if (this.scores[ids[1]] > this.scores[ids[0]]) {
                this.winner = ids[1];
            } else {
                this.winner = 'draw';
            }
        }
    }

    getState(): GameState {
        return {
            roomId: this.id,
            players: this.players,
            gridSize: this.gridSize,
            edges: Array.from(this.edges),
            boxes: this.boxes,
            scores: this.scores,
            currentTurn: this.players[this.currentTurnIndex]?.id,
            winner: this.winner,
            status: this.status
        };
    }
}
