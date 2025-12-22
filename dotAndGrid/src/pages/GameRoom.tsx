import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useSocket } from '../context/SocketContext';
import type { GameState, Edge } from '../types';
import { Grid } from '../components/Grid';
import { ScoreBoard } from '../components/ScoreBoard';
import { InstructionsModal } from '../components/InstructionsModal';

export const GameRoom: React.FC = () => {
    const { roomId } = useParams();
    const { socket } = useSocket();
    const navigate = useNavigate();
    const [gameState, setGameState] = useState<GameState | null>(null);
    const [showInstructions, setShowInstructions] = useState(false);

    useEffect(() => {
        if (!socket || !roomId) return;

        socket.on('game_update', (newState: GameState) => {
            setGameState(newState);
        });

        socket.emit('join_room', { roomId }, (response: { success: boolean, gameState: GameState, error?: string }) => {
            if (response.success) {
                setGameState(response.gameState);
            } else {
                alert(response.error);
                navigate('/');
            }
        });

        return () => {
            socket.off('game_update');
        };
    }, [socket, roomId, navigate]);

    const handleEdgeClick = (edge: Edge) => {
        if (!socket || !roomId) return;
        socket.emit('make_move', { roomId, edge });
    };

    const handleShare = async () => {
        const url = window.location.href;
        const shareData = {
            title: 'Dots and Boxes',
            text: `Join my game! Room ID: ${roomId}`,
            url: url
        };

        if (navigator.share) {
            try {
                await navigator.share(shareData);
            } catch (err) {
                console.log('Share canceled or failed', err);
            }
        } else {
            // Fallback
            navigator.clipboard.writeText(url).then(() => {
                alert('Room Link copied to clipboard!');
            }).catch(() => {
                alert(`Room ID: ${roomId}`);
            });
        }
    };

    if (!gameState) return <div style={{ padding: '20px' }}>Loading game...</div>;

    const myId = socket?.id || '';

    return (
        <div style={{ paddingBottom: '20px' }}>
            <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '10px 20px',
                backgroundColor: 'var(--header-bg)',
                borderBottom: '1px solid var(--border-color)'
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                    <div style={{ fontSize: '1.2rem' }}>Room: <strong>{roomId}</strong></div>
                    <button
                        onClick={handleShare}
                        style={{ padding: '5px 10px', fontSize: '0.9rem' }}
                        title="Share Room Link"
                    >
                        Share Room 🔗
                    </button>
                    <button
                        onClick={() => setShowInstructions(true)}
                        style={{ padding: '5px 10px', fontSize: '0.9rem', backgroundColor: 'transparent', border: '1px solid var(--border-color)' }}
                    >
                        How to Play
                    </button>
                </div>
                <button onClick={() => { navigate('/'); }} style={{ cursor: 'pointer', fontSize: '0.9rem' }}>Leave</button>
            </div>

            <ScoreBoard gameState={gameState} myId={myId} />
            <Grid gameState={gameState} playerId={myId} onEdgeClick={handleEdgeClick} />

            {showInstructions && <InstructionsModal onClose={() => setShowInstructions(false)} />}
        </div>
    );
};
