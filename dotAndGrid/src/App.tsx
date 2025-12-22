import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { SocketProvider } from './context/SocketContext';
import { LandingPage } from './pages/LandingPage';
import { GameRoom } from './pages/GameRoom';

function App() {
  return (
    <SocketProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/room/:roomId" element={<GameRoom />} />
        </Routes>
      </BrowserRouter>
    </SocketProvider>
  );
}

export default App;
