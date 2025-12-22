export type PlayerId = string;

export interface Player {
    id: PlayerId;
    initials: string; // "P1" or "P2"
    connected: boolean;
}

export interface Edge {
    x1: number;
    y1: number;
    x2: number;
    y2: number;
}

export interface GameState {
    roomId: string;
    players: Player[];
    gridSize: number;
    edges: string[]; // Serialized edges "x1,y1-x2,y2"
    boxes: { [key: string]: string }; // "x,y" -> playerId
    scores: { [key: string]: number };
    currentTurn: PlayerId;
    winner: PlayerId | null;
    status: 'waiting' | 'playing' | 'finished';
}

export interface MoveResult {
    valid: boolean;
    completedBoxes?: number;
    nextTurn?: PlayerId;
    error?: string;
}
