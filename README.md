# Dots and Boxes

A real-time multiplayer Dots and Boxes game built with React, Node.js, and Socket.IO.

## Features
- Real-time multiplayer gameplay
- Custom grid sizes (5x5, 10x10, etc.)
- Room-based matchmaking
- SVG-based interactive grid
- Live turn updates and score tracking

## Project Structure
- **dotAndGridAPI**: Node.js + Express + Socket.IO Backend
- **dotAndGrid**: React + TypeScript Frontend

## Getting Started

### Prerequisites
- Node.js (v18 or higher recommended)

### 1. Start the Backend
The backend handles the game state and multiplayer synchronization.

```bash
cd dotAndGridAPI
npm install
npm run dev
```
The server will start on port `3001`.

### 2. Start the Frontend
The frontend provides the game interface.

```bash
cd dotAndGrid
npm install
npm run dev
```
The application will be available at `http://localhost:5173`.

## How to Play
1. Open the application in **two** different browser tabs or windows (to simulate two players).
2. **Player 1**:
   - Select a grid size (e.g., 10x10).
   - Click "Create Room".
   - Copy the **Room ID** from the scoreboard.
3. **Player 2**:
   - Enter the **Room ID** provided by Player 1.
   - Click "Join Room".
4. **Gameplay**:
   - Click on the empty lines between dots to make a move.
   - Completing a square (box) claims it for you and grants an **extra turn**.
   - The game ends when all boxes are filled. The player with the most boxes wins!
