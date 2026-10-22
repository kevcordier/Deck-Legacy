import { KingdomCards } from '@components/KingdomViewer/KingdomCards';
import ScoreTooltip from '@components/Tooltips/ScoreTooltip';
import { Button } from '@components/ui/Button/Button';
import { FadeInScale } from '@components/ui/FadeInScale/FadeInScale';
import { Glory } from '@components/ui/Glory/Glory';
import { Text } from '@components/ui/Text/Text';
import { Tooltip } from '@components/ui/Tooltip/Tooltip';
import { useGame } from '@hooks/useGame';
import { useKingdoms } from '@hooks/useKingdoms';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ScrollView, View } from 'react-native';

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
  const { id } = useGame();
  // The session id is the kingdom id (none for a tutorial outside a kingdom).
  const kingdom = useKingdoms().find(k => k.id === id);
  const [kingdomOpen, setKingdomOpen] = useState(false);

  return (
    <>
      <ScrollView contentContainerClassName="grow items-center justify-center p-4">
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

          {kingdom && (
            <Button onPress={() => setKingdomOpen(true)} color="base-primary" size="md">
              {t('gameOver.viewKingdom')}
            </Button>
          )}

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
      </ScrollView>

      {kingdom && kingdomOpen && (
        <KingdomCards kingdom={kingdom} onClose={() => setKingdomOpen(false)} />
      )}
    </>
  );
}
