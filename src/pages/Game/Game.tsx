import { GameBoard } from '@components/GameBoard/GameBoard';
import { GameOverScreen } from '@components/GameOverScreen/GameOverScreen';
import { Header } from '@components/Header/Header';
import { OptionsModal } from '@components/OptionsModal/OptionsModal';
import { ResourceBar } from '@components/ResourceBar/ResourceBar';
import { RulesModal } from '@components/RulesModal/RulesModal';
import { Button } from '@components/ui/Button/Button';
import { EmptyState } from '@components/ui/EmptyState/EmptyState';
import { Phase } from '@engine/domain/types/Phase';
import { useGame } from '@hooks/useGame';
import { useGameUI } from '@hooks/useGameInterface';
import { useTranslation } from 'react-i18next';

export function Game() {
  const { state, deleteSave, startGame } = useGame();
  const { t } = useTranslation();
  const { setOptionsOpen, setRulesOpen, optionsOpen, rulesOpen } = useGameUI();

  const isGamePlaying = state.phase !== Phase.PREGAME && state.phase !== Phase.GAME_OVER;

  return (
    <div className="z-1 flex h-screen flex-col">
      <Header />

      {isGamePlaying && <ResourceBar />}

      {isGamePlaying && <GameBoard />}

      {state.phase === Phase.PREGAME && (
        <EmptyState
          title={t('game.title')}
          subtitle={t('game.subtitle')}
          action={
            <Button onClick={startGame} color="primary" size="md">
              {t('pregame.startNew')}
            </Button>
          }
        >
          <Button variant="text" color="ink" size="sm" onClick={() => setRulesOpen(true)}>
            {t('pregame.viewRules')}
          </Button>
        </EmptyState>
      )}

      {state.phase === Phase.GAME_OVER && <GameOverScreen />}

      {rulesOpen && <RulesModal onClose={() => setRulesOpen(false)} />}

      {optionsOpen && (
        <OptionsModal
          onClose={() => setOptionsOpen(false)}
          onReset={() => {
            deleteSave();
          }}
        />
      )}
    </div>
  );
}
