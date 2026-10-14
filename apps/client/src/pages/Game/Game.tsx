import { GameBoard } from '@components/GameBoard/GameBoard';
import { GameHeader } from '@components/GameHeader/GameHeader';
import { OptionsModal } from '@components/OptionsModal/OptionsModal';
import { PurgeModal } from '@components/PurgeModal/PurgeModal';
import { ResourceBar } from '@components/ResourceBar/ResourceBar';
import { RulesModal } from '@components/RulesModal/RulesModal';
import { TutorialOverlay } from '@components/Tutorial/TutorialOverlay';
import { TutorialStage } from '@components/Tutorial/TutorialStage';
import { Button } from '@components/ui/Button/Button';
import { GameOverScreen } from '@components/ui/GameOverScreen/GameOverScreen';
import { Text } from '@components/ui/Text/Text';
import { TutorialProvider } from '@contexts/TutorialProvider';
import { Phase } from '@deck-legacy/engine/domain/enums';
import { FULL_SIZE, PAGE_BACKGROUND } from '@helpers/pageBackground';
import { useGame } from '@hooks/useGame';
import { useGameUI } from '@hooks/useGameInterface';
import { syncNow } from '@services/sync';
import { router } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { ImageBackground, ScrollView, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export function Game() {
  const {
    id,
    defs,
    gameState,
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
  const { t } = useTranslation();
  const { setOptionsOpen, setRulesOpen, optionsOpen, rulesOpen } = useGameUI();

  const isGamePlaying =
    gameState.phase !== Phase.PRE_GAME &&
    gameState.phase !== Phase.GAME_OVER &&
    gameState.phase !== Phase.EXPANSION_CHOICE;

  /** Back to the kingdoms: the save is already local, push it now when online. */
  const goHome = () => {
    setOptionsOpen(false);
    void syncNow();
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
        <SafeAreaView className="bg-background/80 flex-1">
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
            <View className="bg-background/75 absolute inset-0 z-50 items-center justify-center p-4">
              <View className="bg-card border-border max-h-full w-full max-w-3xl rounded-lg border p-6">
                <ScrollView contentContainerClassName="gap-4">
                  <Text className="font-display text-base-primary text-2xl">
                    {t('campaign.chooseExpansionTitle')}
                  </Text>
                  <Text className="text-ink-card text-sm">
                    {t('campaign.chooseExpansionDescription')}
                  </Text>
                  {availableExpansions.map(expansion => (
                    <View key={expansion} className="gap-1 sm:flex-row sm:items-start sm:gap-4">
                      <View className="items-start sm:w-48">
                        <Button
                          onPress={() => selectExpansion(expansion)}
                          color="base-primary"
                          size="md"
                          variant="link"
                        >
                          {t(`campaign.expansions.${expansion}.title`)}
                        </Button>
                      </View>
                      <Text className="text-ink-card flex-1 text-sm">
                        {t(`campaign.expansions.${expansion}.description`)}
                      </Text>
                    </View>
                  ))}
                </ScrollView>
              </View>
            </View>
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

          {optionsOpen && <OptionsModal onClose={() => setOptionsOpen(false)} onGoHome={goHome} />}
        </SafeAreaView>
        <TutorialStage />
        <TutorialOverlay />
      </ImageBackground>
    </TutorialProvider>
  );
}
