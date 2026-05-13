import { GameBoard } from '@components/GameBoard/GameBoard';
import { Header } from '@components/Header/Header';
import { OptionsModal } from '@components/OptionsModal/OptionsModal';
import { ResourceBar } from '@components/ResourceBar/ResourceBar';
import { RulesModal } from '@components/RulesModal/RulesModal';
import { Button } from '@components/ui/Button/Button';
import { ButtonGroup } from '@components/ui/ButtonGroup/ButtonGroup';
import { Checkbox } from '@components/ui/Checkbox/Checkbox';
import { EmptyState } from '@components/ui/EmptyState/EmptyState';
import { GameOverScreen } from '@components/ui/GameOverScreen/GameOverScreen';
import { TutorialProvider } from '@contexts/TutorialProvider';
import { Phase } from '@engine/domain/types/Phase';
import { useGame } from '@hooks/useGame';
import { useGameUI } from '@hooks/useGameInterface';
import { useTranslation } from 'react-i18next';

export function Game() {
  const { gameState, deleteSave, startGame, startTutorial, score } = useGame();
  const { t, i18n } = useTranslation();
  const {
    setOptionsOpen,
    setRulesOpen,
    optionsOpen,
    rulesOpen,
    tutorialEnabled,
    setTutorialEnabled,
  } = useGameUI();

  const isGamePlaying = gameState.phase !== Phase.PRE_GAME && gameState.phase !== Phase.GAME_OVER;
  const selectedLanguage = i18n.resolvedLanguage?.startsWith('fr') ? 'fr' : 'en';

  const handleStartGame = () => {
    if (tutorialEnabled) {
      startTutorial();
    } else {
      startGame();
    }
  };

  return (
    <TutorialProvider>
      <div className="z-1 flex h-screen flex-col" data-tour="game">
        <Header />
        {isGamePlaying && <ResourceBar />}
        {isGamePlaying && <GameBoard />}
        {gameState.phase === Phase.PRE_GAME && (
          <EmptyState
            title={t('game.title')}
            subtitle={t('game.subtitle')}
            action={
              <Button onClick={handleStartGame} color="primary" size="md">
                {t('pregame.startNew')}
              </Button>
            }
          >
            <div className="flex w-full justify-center">
              <ButtonGroup
                label={t('options.language')}
                value={selectedLanguage}
                onChange={value => i18n.changeLanguage(value)}
                size="xs"
                font="body"
                className="w-fit items-center"
                options={[
                  { children: 'EN', value: 'en' },
                  { children: 'FR', value: 'fr' },
                ]}
              />
            </div>
            <Checkbox
              label={t('pregame.tutorial')}
              checked={tutorialEnabled}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                setTutorialEnabled(e.target.checked)
              }
            />
            <Button variant="text" color="ink" size="sm" onClick={() => setRulesOpen(true)}>
              {t('pregame.viewRules')}
            </Button>
          </EmptyState>
        )}

        {gameState.phase === Phase.GAME_OVER && (
          <GameOverScreen score={score} round={gameState.round} onStartNewGame={startGame} />
        )}

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
    </TutorialProvider>
  );
}
