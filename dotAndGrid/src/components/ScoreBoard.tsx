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
        <div style={{ padding: '20px', textAlign: 'center' }}>
            <h2 style={{ color: 'var(--text-color)' }}>{getStatusMessage()}</h2>
            <div style={{ display: 'flex', justifyContent: 'center', gap: '30px', marginTop: '10px' }}>
                {players.map(p => {
                    const isMe = p.id === myId;
                    const score = scores[p.id] || 0;
                    const isTurn = currentTurn === p.id && status === 'playing';
                    const initials = p.initials;

                    // Determine border/text color based on player
                    const colorVar = initials === 'P1' ? 'var(--box-p1)' : 'var(--box-p2)';
                    const borderColor = initials === 'P1' ? '#ff4444' : '#6666ff'; // Stronger color for border

                    return (
                        <div key={p.id} style={{
                            padding: '15px 25px',
                            border: `2px solid ${borderColor}`,
                            borderRadius: '8px',
                            fontWeight: isTurn ? 'bold' : 'normal',
                            backgroundColor: isTurn ? 'var(--header-bg)' : 'transparent',
                            boxShadow: isTurn ? `0 0 10px ${colorVar}` : 'none',
                            transition: 'all 0.3s ease'
                        }}>
                            <div style={{ fontSize: '1rem', color: 'var(--text-color)' }}>
                                {isMe ? 'You' : 'Opponent'} ({p.initials})
                            </div>
                            <div style={{ fontSize: '2rem', marginTop: '5px' }}>{score}</div>
                        </div>
                    );
                })}
            </div>
            {status === 'finished' && (
                <button
                    onClick={() => window.location.reload()}
                    style={{ marginTop: '20px', padding: '10px 20px', cursor: 'pointer' }}
                >
                    Play Again
                </button>
            )}
        </div>
    );
};
