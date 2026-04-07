import { GameProvider } from '@contexts/GameProvider';
import { Game } from './pages/Game';
import './styles/game.css';
import { GameUIProvider } from '@contexts/GameUIProvider';

export default function App() {
  return (
    <GameUIProvider>
      <GameProvider>
        <Game />
      </GameProvider>
    </GameUIProvider>
  );
}
