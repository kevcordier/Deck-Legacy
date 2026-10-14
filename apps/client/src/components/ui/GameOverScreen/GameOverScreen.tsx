import { GameCard } from '@components/GameCard/GameCard';
import ScoreTooltip from '@components/Tooltips/ScoreTooltip';
import { Button } from '@components/ui/Button/Button';
import { FadeInScale } from '@components/ui/FadeInScale/FadeInScale';
import { Glory } from '@components/ui/Glory/Glory';
import { Grid } from '@components/ui/Grid/Grid';
import { Modal } from '@components/ui/Modal/Modal';
import { Text } from '@components/ui/Text/Text';
import { Tooltip } from '@components/ui/Tooltip/Tooltip';
import { useGame } from '@hooks/useGame';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { View } from 'react-native';

type GameOverScreenProps = {
  readonly score: number;
  /** Back to the kingdoms (home page). */
  readonly onGoHome: () => void;
  readonly onContinueCampaign?: () => void;
  readonly canContinueCampaign?: boolean;
};

export function GameOverScreen({
  score,
  onGoHome,
  onContinueCampaign,
  canContinueCampaign = false,
}: GameOverScreenProps) {
  const { t } = useTranslation();
  const { gameState } = useGame();
  const [kingdomOpen, setKingdomOpen] = useState(false);
  const kingdomCards = Object.values(gameState.instances)
    .filter(({ id }) =>
      [
        ...gameState.discardPile,
        ...gameState.permanents,
        ...gameState.board,
        ...gameState.drawPile,
      ].includes(id),
    )
    .sort((a, b) => a.id - b.id);

  return (
    <>
      <View className="bg-background/75 absolute inset-0 z-50 items-center justify-center p-4">
        <FadeInScale className="bg-card border-border w-full max-w-xl items-center gap-6 rounded-lg border p-8">
          <Text className="font-display text-base-primary text-center text-3xl tracking-tight">
            {t('gameOver.title')}
          </Text>

          <View className="items-center gap-2">
            <Tooltip
              position="bottom"
              content={<ScoreTooltip />}
              className="items-center justify-center"
            >
              <Glory glory={score} className="size-20" textClassName="text-2xl" />
            </Tooltip>
            <Text className="font-display text-ink-card text-lg">{t('gameOver.glory')}</Text>
          </View>

          <Button onPress={() => setKingdomOpen(true)} color="base-primary" size="md">
            {t('gameOver.viewKingdom')}
          </Button>

          <Text className="text-ink-card text-center">{t('gameOver.descriptionEndGame')}</Text>

          <View className="items-center justify-center gap-2">
            {onContinueCampaign && (
              <Button onPress={onContinueCampaign} color="base-primary" size="md">
                {canContinueCampaign ? t('gameOver.continueCampaign') : t('gameOver.saveScore')}
              </Button>
            )}

            <Button onPress={onGoHome} color="base-primary" size="md">
              {t('options.backHome')}
            </Button>
          </View>
        </FadeInScale>
      </View>

      {kingdomOpen && (
        <Modal
          title={t('gameOver.kingdomTitle')}
          subtitle={t('deckViewer.modalSubtitle', { count: kingdomCards.length })}
          onClose={() => setKingdomOpen(false)}
          label="game-over-kingdom"
        >
          {kingdomCards.length === 0 ? (
            <Text className="text-ink/50 font-body-italic text-sm">
              {t('gameOver.kingdomEmpty')}
            </Text>
          ) : (
            <Grid minItemWidth={240} maxColumns={4}>
              {kingdomCards.map(inst => (
                <GameCard key={inst.id} instance={inst} />
              ))}
            </Grid>
          )}
        </Modal>
      )}
    </>
  );
}
