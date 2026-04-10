import { GameProvider } from '@contexts/GameProvider';
import { Game } from './pages/Game/Game';
import './styles/game.css';
import { GameUIProvider } from '@contexts/GameUIProvider';
import { loadSave } from '@engine/infrastructure/persistence';

export default function App() {
  const save = loadSave();

  return (
    <GameUIProvider>
      <GameProvider initialState={save?.saveState} initialEvents={save?.events}>
        <Game />
      </GameProvider>
    </GameUIProvider>
  );
}
