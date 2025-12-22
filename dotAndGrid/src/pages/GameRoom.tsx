import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useSocket } from '../context/SocketContext';
import type { GameState, Edge } from '../types';
import { Grid } from '../components/Grid';
import { ScoreBoard } from '../components/ScoreBoard';

export const GameRoom: React.FC = () => {
    const { roomId } = useParams();
    const { socket } = useSocket();
    const navigate = useNavigate();
    const [gameState, setGameState] = useState<GameState | null>(null);

    useEffect(() => {
        if (!socket || !roomId) return;

        // Listen for updates
        socket.on('game_update', (newState: GameState) => {
            setGameState(newState);
        });

        // Initial join if coming directly via URL
        // In a real app, might want better check if already joined
        // For MVP, we'll emit join again or rely on the fact that landing page handled it if navigated from there
        // Note: If user refreshes, they might need to rejoin logic in App or here.
        // Let's attempt to fetch state or join if socket just connected
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

    if (!gameState) return <div>Loading game...</div>;

    const myId = socket?.id || '';

    return (
        <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px', background: '#eee' }}>
                <div>Room: <strong>{roomId}</strong></div>
                <button onClick={() => { navigate('/'); }} style={{ cursor: 'pointer' }}>Leave Room</button>
            </div>

            <ScoreBoard gameState={gameState} myId={myId} />
            <Grid gameState={gameState} playerId={myId} onEdgeClick={handleEdgeClick} />
        </div>
    );
};
