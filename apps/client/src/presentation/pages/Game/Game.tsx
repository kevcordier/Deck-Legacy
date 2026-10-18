import { ExpansionChoice } from '@components/ExpansionChoice/ExpansionChoice';
import { GameBoard } from '@components/GameBoard/GameBoard';
import { GameHeader } from '@components/GameHeader/GameHeader';
import { OptionsModal } from '@components/OptionsModal/OptionsModal';
import { PurgeModal } from '@components/PurgeModal/PurgeModal';
import { ResourceBar } from '@components/ResourceBar/ResourceBar';
import { RulesModal } from '@components/RulesModal/RulesModal';
import { TutorialOverlay } from '@components/Tutorial/TutorialOverlay';
import { TutorialStage } from '@components/Tutorial/TutorialStage';
import { GameOverScreen } from '@components/ui/GameOverScreen/GameOverScreen';
import { TutorialProvider } from '@contexts/TutorialProvider';
import { Phase } from '@deck-legacy/engine/domain/enums';
import { useAppServices } from '@hooks/useAppServices';
import { useGame } from '@hooks/useGame';
import { useGameUI } from '@hooks/useGameInterface';
import { useIsDesktop } from '@hooks/useIsDesktop';
import {
  FULL_SIZE,
  PAGE_BACKGROUND,
  PAGE_EDGES,
  PAGE_EDGES_WITH_FOOTER,
} from '@styles/pageConstants';
import { router } from 'expo-router';
import { ImageBackground } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export function Game() {
  const { catalog, sync } = useAppServices();
  const {
    id,
    defs,
    gameState,
    score,
    availableExpansions,
    continueCampaign,
    selectExpansion,
    purgeBatch,
    purgeCandidates,
    purgePermanentCandidates,
    selectedPurgeIds,
    canSelectPermanentForPurge,
    isPurgeSelectionComplete,
    selectPurgeCard,
    selectPurgePermanent,
    finalizePurge,
  } = useGame();
  const { setOptionsOpen, setRulesOpen, optionsOpen, rulesOpen } = useGameUI();
  const isDesktop = useIsDesktop();

  const isGamePlaying =
    gameState.phase !== Phase.PRE_GAME &&
    gameState.phase !== Phase.GAME_OVER &&
    gameState.phase !== Phase.EXPANSION_CHOICE;

  /** Back to the kingdoms: the save is already local, push it now when online. */
  const goHome = () => {
    setOptionsOpen(false);
    void sync.syncNow();
    if (router.canGoBack()) router.back();
    else router.replace('/');
  };

  return (
    <TutorialProvider key={id}>
      <ImageBackground
        source={PAGE_BACKGROUND}
        resizeMode="cover"
        className="flex-1"
        imageStyle={FULL_SIZE}
      >
        <SafeAreaView
          edges={isGamePlaying && !isDesktop ? PAGE_EDGES_WITH_FOOTER : PAGE_EDGES}
          className="bg-background/80 flex-1"
        >
          <GameHeader />
          {isGamePlaying && <ResourceBar />}
          {isGamePlaying && <GameBoard />}
          {gameState.phase === Phase.GAME_OVER && (
            <GameOverScreen
              score={score}
              onGoHome={goHome}
              canContinueCampaign={availableExpansions.length > 0}
              onContinueCampaign={continueCampaign}
            />
          )}

          {gameState.phase === Phase.EXPANSION_CHOICE && (
            <ExpansionChoice
              expansions={availableExpansions}
              configs={catalog.expansions}
              onSelect={selectExpansion}
            />
          )}

          {gameState.phase === Phase.PURGE && (
            <PurgeModal
              defs={defs}
              instances={gameState.instances}
              batchSize={gameState.purgeState?.batchSize ?? 0}
              permanentToPurge={gameState.purgeState?.permanentToPurge ?? 0}
              purgeBatch={purgeBatch}
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
              onGoHome={goHome}
              seed={gameState.seed}
            />
          )}
        </SafeAreaView>
        <TutorialStage />
        <TutorialOverlay />
      </ImageBackground>
    </TutorialProvider>
  );
}
