import React from 'react';
import type { GameState, PlayerId } from '../types';

interface ScoreBoardProps {
    gameState: GameState;
    myId: PlayerId;
}

export const ScoreBoard: React.FC<ScoreBoardProps> = ({ gameState, myId }) => {
    const { players, scores, currentTurn, status, winner } = gameState;

    const getStatusMessage = () => {
        if (status === 'waiting') return 'Waiting for opponent...';
        if (status === 'finished') {
            if (winner === 'draw') return 'Game Over - Draw!';
            return winner === myId ? 'You Won!' : 'Opponent Won!';
        }
        return currentTurn === myId ? 'Your Turn' : "Opponent's Turn";
    };

    return (
        <div style={{ padding: '0 12px', textAlign: 'center' }}>
            <h2 style={{
                color: 'var(--text-color)',
                margin: '8px 0', // Reduced margin
                fontSize: '1rem', // Smaller text
                fontWeight: 600,
                opacity: 0.9
            }}>{getStatusMessage()}</h2>
            <div style={{ display: 'flex', justifyContent: 'center', gap: '12px', marginTop: '4px' }}>
                {players.map(p => {
                    const isMe = p.id === myId;
                    const score = scores[p.id] || 0;
                    const isTurn = currentTurn === p.id && status === 'playing';
                    const initials = p.initials;

                    // Determine border/text color based on player
                    const colorVar = initials === 'P1' ? 'var(--primary-color)' : 'var(--secondary-color)';

                    return (
                        <div key={p.id} style={{
                            padding: '8px 16px', // Compact padding
                            border: `2px solid ${isTurn ? colorVar : 'var(--border-color)'}`,
                            borderRadius: '10px',
                            backgroundColor: 'var(--card-bg)',
                            position: 'relative',
                            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                            transform: isTurn ? 'scale(1.02)' : 'scale(1)', // Subtle scale
                            boxShadow: isTurn ? `0 0 10px -3px ${colorVar}` : 'none', // Subtler shadow
                            minWidth: '90px' // Smaller min-width
                        }}>
                            {isTurn && (
                                <div style={{
                                    position: 'absolute',
                                    top: 0, left: 0, right: 0, bottom: 0,
                                    borderRadius: '8px',
                                    animation: 'pulse-ring 2s cubic-bezier(0.4, 0, 0.6, 1) infinite'
                                }} />
                            )}
                            <div style={{
                                fontSize: '0.75rem',
                                color: isTurn ? colorVar : 'var(--text-color)',
                                fontWeight: 700,
                                textTransform: 'uppercase',
                                letterSpacing: '0.5px'
                            }}>
                                {isMe ? 'You' : 'Opponent'}
                            </div>
                            <div style={{
                                fontSize: '1.5rem', // Smaller score font
                                marginTop: '2px', // Tighter spacing
                                lineHeight: 1,
                                fontWeight: 700,
                                color: 'var(--text-color)'
                            }}>{score}</div>
                        </div>
                    );
                })}
            </div>
            {status === 'finished' && (
                <button
                    onClick={() => window.location.reload()}
                    style={{
                        marginTop: '12px',
                        padding: '8px 24px',
                        fontSize: '0.9rem',
                        backgroundColor: 'var(--primary-color)',
                        color: 'white',
                        border: 'none',
                        boxShadow: '0 4px 6px -1px rgba(99, 102, 241, 0.4)'
                    }}
                >
                    Play Again
                </button>
            )}
        </div>
    );
};
