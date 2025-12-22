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
            <h2>{getStatusMessage()}</h2>
            <div style={{ display: 'flex', justifyContent: 'center', gap: '30px', marginTop: '10px' }}>
                {players.map(p => {
                    const isMe = p.id === myId;
                    const score = scores[p.id] || 0;
                    return (
                        <div key={p.id} style={{
                            padding: '10px',
                            border: `2px solid ${p.initials === 'P1' ? 'red' : 'blue'}`,
                            borderRadius: '8px',
                            fontWeight: currentTurn === p.id && status === 'playing' ? 'bold' : 'normal',
                            background: currentTurn === p.id && status === 'playing' ? '#f0f0f0' : 'transparent'
                        }}>
                            <div>{isMe ? 'You' : 'Opponent'} ({p.initials})</div>
                            <div style={{ fontSize: '24px' }}>{score}</div>
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
