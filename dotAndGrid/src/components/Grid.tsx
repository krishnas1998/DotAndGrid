import React, { } from 'react';
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


    // We use state to track colors if they change (e.g. theme switch), 
    // but for simplicity in SVG we often rely on CSS classes or currentcolor where possible.
    // However, SVG 'fill' attributes don't always inherit nicely without explicit 'var()'.

    const isMyTurn = currentTurn === playerId && status === 'playing';

    const isEdgeTaken = (x1: number, y1: number, x2: number, y2: number) => {
        if (x1 > x2 || (x1 === x2 && y1 > y2)) { const t = x1; x1 = x2; x2 = t; const ty = y1; y1 = y2; y2 = ty; }
        return edges.includes(`${x1},${y1}-${x2},${y2}`);
    };

    const handleEdgeClick = (x1: number, y1: number, x2: number, y2: number) => {
        if (!isMyTurn) return;
        if (isEdgeTaken(x1, y1, x2, y2)) return;
        onEdgeClick({ x1, y1, x2, y2 });
    };

    return (
        <div style={{ display: 'flex', justifyContent: 'center', overflow: 'auto', padding: '20px' }}>
            <svg width={width} height={height}>
                {/* Defs/Styles for SVG usage of CSS vars */}
                <style>
                    {`
                        .dot { fill: var(--grid-dot); }
                        .edge-taken { fill: var(--grid-edge-taken); }
                        .edge-free { fill: transparent; transition: fill 0.2s; }
                        .edge-free:hover { fill: var(--grid-edge-hover); cursor: pointer; }
                        .edge-disabled { fill: transparent; }
                        .box-p1 { fill: var(--box-p1); }
                        .box-p2 { fill: var(--box-p2); }
                        .text-initials { fill: var(--text-color); font-weight: bold; font-size: 14px; }
                        .text-initials-p1 { fill: #ff4444; } /* Optional specific colors for text if needed, maintaining contrast */
                        .text-initials-p2 { fill: #6666ff; }
                    `}
                </style>

                {/* Boxes */}
                {Array.from({ length: gridSize - 1 }).map((_, x) =>
                    Array.from({ length: gridSize - 1 }).map((_, y) => {
                        const owner = boxes[`${x},${y}`];
                        if (owner) {
                            const player = gameState.players.find(p => p.id === owner);
                            const initials = player?.initials || '?';
                            const isP1 = initials === 'P1';
                            return (
                                <g key={`box-${x}-${y}`}>
                                    <rect
                                        x={padding + x * dotSpacing}
                                        y={padding + y * dotSpacing}
                                        width={dotSpacing}
                                        height={dotSpacing}
                                        className={isP1 ? 'box-p1' : 'box-p2'}
                                    />
                                    <text
                                        x={padding + x * dotSpacing + dotSpacing / 2}
                                        y={padding + y * dotSpacing + dotSpacing / 2}
                                        textAnchor="middle"
                                        dominantBaseline="middle"
                                        className={isP1 ? 'text-initials-p1' : 'text-initials-p2'}
                                        style={{ fontWeight: 'bold' }}
                                    >
                                        {initials}
                                    </text>
                                </g>
                            );
                        }
                        return null;
                    })
                )}

                {/* Horizontal Edges */}
                {Array.from({ length: gridSize }).map((_, y) =>
                    Array.from({ length: gridSize - 1 }).map((_, x) => {
                        const taken = isEdgeTaken(x, y, x + 1, y);
                        const interactable = !taken && isMyTurn;
                        return (
                            <rect
                                key={`h-${x}-${y}`}
                                x={padding + x * dotSpacing + dotRadius}
                                y={padding + y * dotSpacing - 5}
                                width={dotSpacing - dotRadius * 2}
                                height={10}
                                className={taken ? 'edge-taken' : (interactable ? 'edge-free' : 'edge-disabled')}
                                onClick={() => handleEdgeClick(x, y, x + 1, y)}
                            />
                        );
                    })
                )}

                {/* Vertical Edges */}
                {Array.from({ length: gridSize }).map((_, x) =>
                    Array.from({ length: gridSize - 1 }).map((_, y) => {
                        const taken = isEdgeTaken(x, y, x, y + 1);
                        const interactable = !taken && isMyTurn;
                        return (
                            <rect
                                key={`v-${x}-${y}`}
                                x={padding + x * dotSpacing - 5}
                                y={padding + y * dotSpacing + dotRadius}
                                width={10}
                                height={dotSpacing - dotRadius * 2}
                                className={taken ? 'edge-taken' : (interactable ? 'edge-free' : 'edge-disabled')}
                                onClick={() => handleEdgeClick(x, y, x, y + 1)}
                            />
                        );
                    })
                )}

                {/* Dots */}
                {Array.from({ length: gridSize }).map((_, x) =>
                    Array.from({ length: gridSize }).map((_, y) => (
                        <circle
                            key={`dot-${x}-${y}`}
                            cx={padding + x * dotSpacing}
                            cy={padding + y * dotSpacing}
                            r={dotRadius}
                            className="dot"
                        />
                    ))
                )}
            </svg>
        </div>
    );
};
