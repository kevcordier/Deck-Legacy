import { Game } from './pages/Game/Game';
import './styles/game.css';
import { GameProvider } from '@contexts/GameProvider';
import { GameUIProvider } from '@contexts/GameUIProvider';
import { loadSave } from '@engine/infrastructure/persistence';

export default function App() {
  const save = loadSave();

  return (
    <GameUIProvider>
      <GameProvider initialEvents={save?.events}>
        <Game />
      </GameProvider>
    </GameUIProvider>
  );
}
