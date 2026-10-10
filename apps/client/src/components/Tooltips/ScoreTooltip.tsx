import { Text } from '@components/ui/Text/Text';
import { useGame } from '@hooks/useGame';
import { useTranslation } from 'react-i18next';
import { View } from 'react-native';

export default function ScoreTooltip() {
  const { t } = useTranslation();
  const { gameState } = useGame();
  const purgedScore = gameState.purgedGlory.reduce((sum, current) => sum + current, 0);
  const segmentScores = Object.entries(gameState.campaignScores);

  const getSegmentLabel = (segment: string): string => {
    if (segment === 'base') return t('resourceBar.baseSegment');

    const expansionTitleKey = `campaign.expansions.${segment}.title`;
    const expansionTitle = t(expansionTitleKey);
    return expansionTitle === expansionTitleKey ? segment : expansionTitle;
  };

  if (segmentScores.length === 0) {
    return (
      <Text className="text-base-ink/70 font-body-italic">
        {t('resourceBar.gloryTooltipEmpty')}
      </Text>
    );
  }

  return (
    <View>
      <Text className="font-body-bold mb-1">{t('resourceBar.gloryTooltipTitle')}</Text>
      <View className="border-border/50 mb-1 gap-1 border-b pb-1">
        {segmentScores.map(([segment, segmentScore]) => (
          <View key={segment} className="flex-row items-center justify-between gap-3">
            <Text className="text-base-ink/80">{getSegmentLabel(segment)}</Text>
            <Text className="font-display text-base-primary">{segmentScore}</Text>
          </View>
        ))}
      </View>
      <View className="flex-row items-center justify-between gap-3">
        <Text className="text-base-ink/80">{t('gameOver.purgedGlory')}</Text>
        <Text className="font-display text-base-primary">{purgedScore}</Text>
      </View>
    </View>
  );
}
