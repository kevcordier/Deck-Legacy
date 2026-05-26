import { GameBoard } from '@components/GameBoard/GameBoard';
import { Header } from '@components/Header/Header';
import { OptionsModal } from '@components/OptionsModal/OptionsModal';
import { PurgeModal } from '@components/PurgeModal/PurgeModal';
import { ResourceBar } from '@components/ResourceBar/ResourceBar';
import { RulesModal } from '@components/RulesModal/RulesModal';
import { Button } from '@components/ui/Button/Button';
import { ButtonGroup } from '@components/ui/ButtonGroup/ButtonGroup';
import { Checkbox } from '@components/ui/Checkbox/Checkbox';
import { EmptyState } from '@components/ui/EmptyState/EmptyState';
import { GameOverScreen } from '@components/ui/GameOverScreen/GameOverScreen';
import { TutorialProvider } from '@contexts/TutorialProvider';
import { Phase } from '@engine/domain/enums';
import { useGame } from '@hooks/useGame';
import { useGameUI } from '@hooks/useGameInterface';
import { useTranslation } from 'react-i18next';

export function Game() {
  const {
    id,
    defs,
    gameState,
    deleteSave,
    startGame,
    startTutorial,
    score,
    availableExpansions,
    continueCampaign,
    selectExpansion,
    purgeCandidates,
    purgePermanentCandidates,
    selectedPurgeIds,
    canSelectPermanentForPurge,
    isPurgeSelectionComplete,
    selectPurgeCard,
    selectPurgePermanent,
    finalizePurge,
  } = useGame();
  const { t, i18n } = useTranslation();
  const {
    setOptionsOpen,
    setRulesOpen,
    optionsOpen,
    rulesOpen,
    tutorialEnabled,
    setTutorialEnabled,
  } = useGameUI();

  const isGamePlaying =
    gameState.phase !== Phase.PRE_GAME &&
    gameState.phase !== Phase.GAME_OVER &&
    gameState.phase !== Phase.EXPANSION_CHOICE;
  const selectedLanguage = i18n.resolvedLanguage?.startsWith('fr') ? 'fr' : 'en';

  const handleStartGame = () => {
    if (tutorialEnabled) {
      startTutorial();
    } else {
      startGame();
    }
  };

  return (
    <TutorialProvider key={id}>
      <div
        className="z-1 min-h-svh h-dvh pt-[env(safe-area-inset-top)] pb-[env(safe-area-inset-bottom)] pl-[env(safe-area-inset-left)] pr-[env(safe-area-inset-right)] bg-[url('https://image.civitai.com/xG1nkqKTMzGDvpLrqFT7WA/6ffce52a-2aa7-4543-ba2c-9d45a22a0a5f/anim=false,width=450,optimized=true/U_ComfyUI_01600_.jpeg')] bg-cover bg-no-repeat bg-clip-content"
        data-tour="game"
      >
        <div className="bg-background/90 dark:bg-background/90 backdrop-blur-xs flex h-full flex-col">
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
            <GameOverScreen
              score={score}
              round={gameState.round}
              onStartNewGame={startGame}
              canContinueCampaign={availableExpansions.length > 0}
              onContinueCampaign={continueCampaign}
            />
          )}

          {gameState.phase === Phase.EXPANSION_CHOICE && (
            <div className="bg-background/75 fixed inset-0 z-50 flex items-center justify-center p-4 scrollbar">
              <div className="bg-card border-border flex w-full max-w-9/10 flex-col gap-4 rounded-lg border p-6">
                <h2 className="font-display text-base-primary text-2xl font-semibold">
                  {t('campaign.chooseExpansionTitle')}
                </h2>
                <p className="text-base-ink text-sm">{t('campaign.chooseExpansionDescription')}</p>
                <table className="table-fixed border-separate border-spacing-2">
                  <tbody>
                    {availableExpansions.map(expansion => (
                      <tr key={expansion}>
                        <td className="w-48">
                          <Button
                            onClick={() => selectExpansion(expansion)}
                            color="base-primary"
                            size="md"
                            variant="link"
                          >
                            {t(`campaign.expansions.${expansion}.title`)}
                          </Button>
                        </td>
                        <td>
                          <p className="text-sm text-base-ink">
                            {t(`campaign.expansions.${expansion}.description`)}
                          </p>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {gameState.phase === Phase.PURGE && (
            <PurgeModal
              defs={defs}
              instances={gameState.instances}
              purgeCandidates={purgeCandidates}
              purgePermanentCandidates={purgePermanentCandidates}
              selectedPurgeIds={selectedPurgeIds}
              canSelectPermanentForPurge={canSelectPermanentForPurge}
              isPurgeSelectionComplete={isPurgeSelectionComplete}
              selectPurgeCard={selectPurgeCard}
              selectPurgePermanent={selectPurgePermanent}
              finalizePurge={finalizePurge}
            />
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
      </div>
    </TutorialProvider>
  );
}
