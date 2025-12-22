import React from 'react';

interface InstructionsModalProps {
    onClose: () => void;
}

export const InstructionsModal: React.FC<InstructionsModalProps> = ({ onClose }) => {
    return (
        <div className="overlay" onClick={onClose}>
            <div className="modal" onClick={e => e.stopPropagation()}>
                <h2>How to Play Dots & Boxes</h2>
                <ul style={{ lineHeight: '1.6' }}>
                    <li><strong>Goal:</strong> Capture more boxes than your opponent.</li>
                    <li><strong>Turn:</strong> Click on a line (horizontal or vertical) to connect two adjacent dots.</li>
                    <li><strong>Scoring:</strong> If your line completes a box (1x1 square), you claim it and get <strong>one more turn</strong>.</li>
                    <li><strong>Strategy:</strong> Try to force your opponent to give you chains of boxes!</li>
                    <li><strong>Game Over:</strong> When all lines are drawn. The player with the most boxes wins.</li>
                </ul>
                <button className="close-btn" onClick={onClose}>Got it!</button>
            </div>
        </div>
    );
};
