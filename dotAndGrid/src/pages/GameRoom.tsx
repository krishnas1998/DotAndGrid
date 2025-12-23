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
        <div style={{
            height: '100vh',
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden'
        }}>
            {/* Header */}
            <header style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '8px 16px', // Reduced padding
                backgroundColor: 'var(--header-bg)',
                borderBottom: '1px solid var(--border-color)',
                boxShadow: '0 2px 4px -1px var(--shadow-color)', // Subtler shadow
                zIndex: 10,
                height: '48px' // Fixed condensed height
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{
                        fontSize: '1rem',
                        fontWeight: 600,
                        color: 'var(--text-color)',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px'
                    }}>
                        <span style={{ opacity: 0.7 }}>Room</span>
                        <span style={{
                            backgroundColor: 'var(--primary-color)',
                            padding: '2px 8px',
                            borderRadius: '6px',
                            color: 'white',
                            fontSize: '0.9rem',
                            fontWeight: 700,
                            letterSpacing: '0.5px'
                        }}>{roomId}</span>
                    </div>
                </div>

                <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                    {/* Compact Action Buttons */}
                    <button
                        onClick={handleShare}
                        style={{
                            padding: '6px',
                            fontSize: '1.2rem',
                            lineHeight: 1,
                            backgroundColor: 'transparent',
                            border: 'none',
                            boxShadow: 'none',
                            cursor: 'pointer'
                        }}
                        title="Share Room Link"
                    >
                        🔗
                    </button>
                    <button
                        onClick={() => setShowInstructions(true)}
                        style={{
                            padding: '6px 12px',
                            fontSize: '0.85rem',
                            backgroundColor: 'transparent',
                            border: '1px solid var(--border-color)',
                            borderRadius: '20px',
                            height: '32px'
                        }}
                    >
                        Help
                    </button>
                    <button
                        onClick={() => navigate('/')}
                        style={{
                            fontSize: '0.85rem',
                            backgroundColor: 'transparent',
                            color: 'var(--secondary-color)',
                            border: 'none',
                            padding: '6px 12px',
                            boxShadow: 'none'
                        }}
                    >
                        Exit
                    </button>
                </div>
            </header>

            {/* Main Content Area */}
            <main style={{
                flex: 1,
                display: 'flex',
                flexDirection: 'column',
                overflow: 'hidden',
                position: 'relative'
            }}>
                <ScoreBoard gameState={gameState} myId={myId} />

                <div style={{
                    flex: 1,
                    overflow: 'hidden',
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'flex-start',
                    padding: '20px',
                    position: 'relative'
                }}>
                    <Grid gameState={gameState} playerId={myId} onEdgeClick={handleEdgeClick} />
                </div>
            </main>

            {showInstructions && <InstructionsModal onClose={() => setShowInstructions(false)} />}
        </div>
    );
};
