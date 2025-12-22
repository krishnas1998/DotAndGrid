import React from 'react';
import type { GameState, Edge } from '../types';

interface GridProps {
    gameState: GameState;
    playerId: string;
    onEdgeClick: (edge: Edge) => void;
}

export const Grid: React.FC<GridProps> = ({ gameState, playerId, onEdgeClick }) => {
    const { gridSize, edges, boxes, currentTurn, status } = gameState;
    const dotSpacing = 40;
    const dotRadius = 4;
    const padding = 20;

    const width = (gridSize - 1) * dotSpacing + padding * 2;
    const height = (gridSize - 1) * dotSpacing + padding * 2;

    const isMyTurn = currentTurn === playerId && status === 'playing';

    // Helper to check if edge exists
    const isEdgeTaken = (x1: number, y1: number, x2: number, y2: number) => {
        // Normalize
        if (x1 > x2 || (x1 === x2 && y1 > y2)) { const t = x1; x1 = x2; x2 = t; const ty = y1; y1 = y2; y2 = ty; }
        return edges.includes(`${x1},${y1}-${x2},${y2}`);
    };

    const handleEdgeClick = (x1: number, y1: number, x2: number, y2: number) => {
        if (!isMyTurn) return;
        if (isEdgeTaken(x1, y1, x2, y2)) return;
        onEdgeClick({ x1, y1, x2, y2 });
    };

    const renderHorizontalEdges = () => {
        const elements = [];
        for (let y = 0; y < gridSize; y++) {
            for (let x = 0; x < gridSize - 1; x++) {
                const taken = isEdgeTaken(x, y, x + 1, y);
                elements.push(
                    <rect
                        key={`h-${x}-${y}`}
                        x={padding + x * dotSpacing + dotRadius}
                        y={padding + y * dotSpacing - 5}
                        width={dotSpacing - dotRadius * 2}
                        height={10}
                        fill={taken ? '#333' : 'transparent'}
                        className={!taken && isMyTurn ? "hover-edge" : ""}
                        style={{ cursor: !taken && isMyTurn ? 'pointer' : 'default', transition: 'fill 0.2s' }}
                        onClick={() => handleEdgeClick(x, y, x + 1, y)}
                        onMouseEnter={(e) => { if (!taken && isMyTurn) e.currentTarget.setAttribute('fill', '#ddd'); }}
                        onMouseLeave={(e) => { if (!taken && isMyTurn) e.currentTarget.setAttribute('fill', 'transparent'); }}
                    />
                );
            }
        }
        return elements;
    };

    const renderVerticalEdges = () => {
        const elements = [];
        for (let x = 0; x < gridSize; x++) {
            for (let y = 0; y < gridSize - 1; y++) {
                const taken = isEdgeTaken(x, y, x, y + 1);
                elements.push(
                    <rect
                        key={`v-${x}-${y}`}
                        x={padding + x * dotSpacing - 5}
                        y={padding + y * dotSpacing + dotRadius}
                        width={10}
                        height={dotSpacing - dotRadius * 2}
                        fill={taken ? '#333' : 'transparent'}
                        className={!taken && isMyTurn ? "hover-edge" : ""}
                        style={{ cursor: !taken && isMyTurn ? 'pointer' : 'default', transition: 'fill 0.2s' }}
                        onClick={() => handleEdgeClick(x, y, x, y + 1)}
                        onMouseEnter={(e) => { if (!taken && isMyTurn) e.currentTarget.setAttribute('fill', '#ddd'); }}
                        onMouseLeave={(e) => { if (!taken && isMyTurn) e.currentTarget.setAttribute('fill', 'transparent'); }}
                    />
                );
            }
        }
        return elements;
    };

    const renderBoxes = () => {
        const elements = [];
        for (let x = 0; x < gridSize - 1; x++) {
            for (let y = 0; y < gridSize - 1; y++) {
                const owner = boxes[`${x},${y}`];
                if (owner) {
                    const initials = gameState.players.find(p => p.id === owner)?.initials || '?';
                    elements.push(
                        <g key={`box-${x}-${y}`}>
                            <rect
                                x={padding + x * dotSpacing}
                                y={padding + y * dotSpacing}
                                width={dotSpacing}
                                height={dotSpacing}
                                fill={initials === 'P1' ? 'rgba(255, 100, 100, 0.2)' : 'rgba(100, 100, 255, 0.2)'}
                            />
                            <text
                                x={padding + x * dotSpacing + dotSpacing / 2}
                                y={padding + y * dotSpacing + dotSpacing / 2}
                                textAnchor="middle"
                                dominantBaseline="middle"
                                fontSize="14"
                                fill="#333"
                                fontWeight="bold"
                            >
                                {initials}
                            </text>
                        </g>
                    );
                }
            }
        }
        return elements;
    };

    const renderDots = () => {
        const elements = [];
        for (let x = 0; x < gridSize; x++) {
            for (let y = 0; y < gridSize; y++) {
                elements.push(
                    <circle
                        key={`dot-${x}-${y}`}
                        cx={padding + x * dotSpacing}
                        cy={padding + y * dotSpacing}
                        r={dotRadius}
                        fill="#000"
                    />
                );
            }
        }
        return elements;
    };

    return (
        <div style={{ display: 'flex', justifyContent: 'center', overflow: 'auto' }}>
            <svg width={width} height={height}>
                {renderBoxes()}
                {renderHorizontalEdges()}
                {renderVerticalEdges()}
                {renderDots()}
            </svg>
        </div>
    );
};
