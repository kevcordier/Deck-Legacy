import { Game } from './pages/Game/Game';
import './styles/game.css';
import { ErrorBoundary } from '@components/ui/ErrorBoundary/ErrorBoundary';
import { GameProvider } from '@contexts/GameProvider';
import { GameUIProvider } from '@contexts/GameUIProvider';
import { loadSave } from '@engine/infrastructure/persistence';
import { Toaster } from 'react-hot-toast';

export default function App() {
  const save = loadSave();

  return (
    <ErrorBoundary>
      <GameUIProvider>
        <GameProvider id={save?.id ?? crypto.randomUUID()} initialEvents={save?.events}>
          <Game />
        </GameProvider>
      </GameUIProvider>
      <Toaster
        toastOptions={{
          className: 'bg-card! text-ink! border-base-border!',
        }}
        position="top-center"
        reverseOrder={false}
        containerStyle={{ zIndex: 9999 }}
      />
    </ErrorBoundary>
  );
}
