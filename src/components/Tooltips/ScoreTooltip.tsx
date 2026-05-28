import { useGame } from '@hooks/useGame';
import { useTranslation } from 'react-i18next';

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

  return segmentScores.length === 0 ? (
    <p className="text-base-ink/70 italic">{t('resourceBar.gloryTooltipEmpty')}</p>
  ) : (
    <>
      <p className="mb-1 font-semibold">{t('resourceBar.gloryTooltipTitle')}</p>
      <ul className="space-y-1 mb-1 border-border/50 border-b pb-1">
        {segmentScores.map(([segment, segmentScore]) => (
          <li key={segment} className="flex items-center justify-between gap-3">
            <span className="text-base-ink/80">{getSegmentLabel(segment)}</span>
            <span className="font-display text-base-primary">{segmentScore}</span>
          </li>
        ))}
      </ul>
      <div className="flex items-center justify-between gap-3">
        <span className="text-base-ink/80">{t('gameOver.purgedGlory')}</span>
        <span className="font-display text-base-primary">{purgedScore}</span>
      </div>
    </>
  );
}
