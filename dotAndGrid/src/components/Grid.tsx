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
        <div style={{
            width: '100%',
            height: '100%',
            overflow: 'auto',
            padding: '10px', // Minimal padding
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'flex-start', // Allows scrolling if larger than container
            touchAction: 'manipulation',
            position: 'relative'
        }}>
            <svg
                width={width}
                height={height}
                style={{
                    minWidth: width, // Ensure it doesn't shrink
                    minHeight: height,
                    margin: 'auto' // Center if smaller than container
                }}
            >
                {/* Defs/Styles for SVG usage of CSS vars */}
                <style>
                    {`
                        .dot { fill: var(--grid-dot); transition: fill 0.3s; }
                        .edge-taken { fill: var(--grid-edge-taken); }
                        .edge-free { fill: transparent; transition: all 0.2s; }
                        .edge-free:hover { fill: var(--grid-edge-hover); cursor: pointer; opacity: 0.6; }
                        .edge-disabled { fill: transparent; }
                        .edge-last-move { fill: var(--last-move-color) !important; filter: drop-shadow(0 0 4px var(--last-move-color)); }
                        .box-p1 { fill: var(--box-p1); transition: fill 0.3s; }
                        .box-p2 { fill: var(--box-p2); transition: fill 0.3s; }
                        .text-initials { fill: var(--text-color); font-weight: 700; font-size: 16px; font-family: 'Outfit', sans-serif; pointer-events: none; }
                        .text-initials-p1 { fill: var(--primary-color); }
                        .text-initials-p2 { fill: var(--secondary-color); }
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
                                <g key={`box-${x}-${y}`} className="animate-pop">
                                    <rect
                                        x={padding + x * dotSpacing}
                                        y={padding + y * dotSpacing}
                                        width={dotSpacing}
                                        height={dotSpacing}
                                        className={isP1 ? 'box-p1' : 'box-p2'}
                                        rx="4"
                                    />
                                    <text
                                        x={padding + x * dotSpacing + dotSpacing / 2}
                                        y={padding + y * dotSpacing + dotSpacing / 2}
                                        textAnchor="middle"
                                        dominantBaseline="middle"
                                        className={isP1 ? 'text-initials-p1 text-initials' : 'text-initials-p2 text-initials'}
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
                        const edgeKey = `${x},${y}-${x + 1},${y}`;
                        const isLastMove = gameState.lastMove === edgeKey || gameState.lastMove === `${x + 1},${y}-${x},${y}`;
                        const interactable = !taken && isMyTurn;
                        const className = taken
                            ? (isLastMove ? 'edge-taken edge-last-move' : 'edge-taken')
                            : (interactable ? 'edge-free' : 'edge-disabled');

                        return (
                            <rect
                                key={`h-${x}-${y}`}
                                x={padding + x * dotSpacing + dotRadius}
                                y={padding + y * dotSpacing - 6} // Slightly larger hit area
                                width={dotSpacing - dotRadius * 2}
                                height={12} // Larger hit area
                                rx="4"
                                className={className}
                                onClick={() => handleEdgeClick(x, y, x + 1, y)}
                            />
                        );
                    })
                )}

                {/* Vertical Edges */}
                {Array.from({ length: gridSize }).map((_, x) =>
                    Array.from({ length: gridSize - 1 }).map((_, y) => {
                        const taken = isEdgeTaken(x, y, x, y + 1);
                        const edgeKey = `${x},${y}-${x},${y + 1}`;
                        const isLastMove = gameState.lastMove === edgeKey || gameState.lastMove === `${x},${y + 1}-${x},${y}`;
                        const interactable = !taken && isMyTurn;
                        const className = taken
                            ? (isLastMove ? 'edge-taken edge-last-move' : 'edge-taken')
                            : (interactable ? 'edge-free' : 'edge-disabled');

                        return (
                            <rect
                                key={`v-${x}-${y}`}
                                x={padding + x * dotSpacing - 6} // Slightly larger hit area
                                y={padding + y * dotSpacing + dotRadius}
                                width={12} // Larger hit area
                                height={dotSpacing - dotRadius * 2}
                                rx="4"
                                className={className}
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
                            r={dotRadius + 1} // Slightly larger dots
                            className="dot"
                        />
                    ))
                )}
            </svg>
        </div>
    );
};
