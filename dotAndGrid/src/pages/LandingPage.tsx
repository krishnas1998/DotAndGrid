import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSocket } from '../context/SocketContext';

export const LandingPage: React.FC = () => {
    const { socket, connected } = useSocket();
    const navigate = useNavigate();
    const [roomIdInput, setRoomIdInput] = useState('');
    const [gridSize, setGridSize] = useState(10);
    const [error, setError] = useState('');

    const handleCreateRoom = () => {
        if (!socket) return;
        socket.emit('create_room', { gridSize }, (response: { roomId: string }) => {
            navigate(`/room/${response.roomId}`);
        });
    };

    const handleJoinRoom = () => {
        if (!socket || !roomIdInput.trim()) return;
        socket.emit('join_room', { roomId: roomIdInput }, (response: { success: boolean, error?: string }) => {
            if (response.success) {
                navigate(`/room/${roomIdInput}`);
            } else {
                setError(response.error || 'Failed to join room');
            }
        });
    };

    if (!connected) return <div>Connecting to server...</div>;

    return (
        <div style={{ maxWidth: '600px', margin: '50px auto', padding: '20px', textAlign: 'center', fontFamily: 'sans-serif' }}>
            <h1>Dots and Boxes</h1>

            <div style={{ marginBottom: '40px' }}>
                <h2>Create New Game</h2>
                <label style={{ marginRight: '10px' }}>Grid Size:</label>
                <select value={gridSize} onChange={e => setGridSize(Number(e.target.value))} style={{ padding: '5px' }}>
                    <option value={5}>5x5 (Quick)</option>
                    <option value={10}>10x10 (Classic)</option>
                    <option value={20}>20x20 (Large)</option>
                </select>
                <br /><br />
                <button onClick={handleCreateRoom} style={{ padding: '10px 20px', cursor: 'pointer', fontSize: '16px' }}>
                    Create Room
                </button>
            </div>

            <hr />

            <div style={{ marginTop: '40px' }}>
                <h2>Join Game</h2>
                <input
                    type="text"
                    placeholder="Enter Room ID"
                    value={roomIdInput}
                    onChange={e => setRoomIdInput(e.target.value.toUpperCase())}
                    style={{ padding: '10px', fontSize: '16px', width: '200px', marginRight: '10px' }}
                />
                <button onClick={handleJoinRoom} style={{ padding: '10px 20px', cursor: 'pointer', fontSize: '16px' }}>
                    Join Room
                </button>
                {error && <div style={{ color: 'red', marginTop: '10px' }}>{error}</div>}
            </div>
        </div>
    );
};
