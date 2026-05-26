import { StickerStockModal } from '@components/StickerStockModal/StickerStockModal';
import { Button } from '@components/ui/Button/Button';
import { Divider } from '@components/ui/Divider/Divider';
import { GloryIcon } from '@components/ui/Icon/icon';
import { IconColors } from '@components/ui/Icon/iconColors';
import { ResourcePill } from '@components/ui/ResourcePill/ResourcePill';
import { Stat } from '@components/ui/Stat/Stat';
import { Tooltip } from '@components/ui/Tooltip/Tooltip';
import { useGame } from '@hooks/useGame';
import { useGameUI } from '@hooks/useGameInterface';
import { useTranslation } from 'react-i18next';

export function ResourceBar() {
  const { t } = useTranslation();
  const { gameState, score } = useGame();
  const { setStickerStockOpen } = useGameUI();

  const { resources, round, turn, drawPile, discardPile, campaignScores } = gameState;
  const entries = Object.entries(resources).filter(([, v]) => v > 0);
  const segmentScores = Object.entries(campaignScores);

  const getSegmentLabel = (segment: string): string => {
    if (segment === 'base') return t('resourceBar.baseSegment');

    const expansionTitleKey = `campaign.expansions.${segment}.title`;
    const expansionTitle = t(expansionTitleKey);
    return expansionTitle === expansionTitleKey ? segment : expansionTitle;
  };

  return (
    <div
      className="bg-background border-b-border scrollbar z-100 flex items-stretch justify-between gap-3 overflow-x-auto border-b px-3 py-1 lg:gap-6 lg:px-6 lg:py-2"
      data-tour="resource-bar"
    >
      <div className="flex shrink-0 items-stretch gap-2 lg:gap-4">
        <Stat label={t('resourceBar.round')} value={round || '—'} />
        <Divider orientation="vertical" />
        <Stat label={t('resourceBar.turn')} value={turn || '—'} />
        <Divider orientation="vertical" />
      </div>

      <div className="flex shrink-0 grow flex-wrap items-center gap-2 lg:gap-4">
        {entries.length === 0 ? (
          <p className="text-sm text-ink/50 italic">{t('resourceBar.noResources')}</p>
        ) : (
          entries.map(([k, v]) => {
            return (
              <div
                key={k}
                className="border-border flex items-center gap-1 rounded border px-2 py-1"
              >
                <span className="font-display">{v}</span>
                <ResourcePill key={k} resource={k} className="size-5" />
              </div>
            );
          })
        )}
      </div>

      <div className="flex shrink-0 items-stretch gap-2 lg:gap-4">
        <div className="hidden shrink-0 items-stretch gap-2 lg:flex lg:gap-4">
          <Divider orientation="vertical" className="hidden lg:inline" />
          <Stat label={t('resourceBar.deck')} value={drawPile.length} />
          <Divider orientation="vertical" />
          <Stat label={t('resourceBar.discard')} value={discardPile.length} />
        </div>

        <div className="flex shrink-0 items-stretch gap-2">
          <Divider orientation="vertical" />
          <Tooltip
            content={
              <>
                <p className="mb-1 font-semibold">{t('resourceBar.gloryTooltipTitle')}</p>
                {segmentScores.length === 0 ? (
                  <p className="text-ink/70 italic">{t('resourceBar.gloryTooltipEmpty')}</p>
                ) : (
                  <ul className="space-y-1">
                    {segmentScores.map(([segment, segmentScore]) => (
                      <li key={segment} className="flex items-center justify-between gap-3">
                        <span className="text-ink/80">{getSegmentLabel(segment)}</span>
                        <span className="font-display text-primary">{segmentScore}</span>
                      </li>
                    ))}
                  </ul>
                )}
              </>
            }
            position="bottom"
            className="items-center gap-1"
            contentClassName="min-w-52 left-0 -translate-x-0"
          >
            <div className="relative" aria-label={t('resourceBar.gloryTooltipTitle')}>
              <GloryIcon color={IconColors.gold} className="size-9" />
              <span className="font-display text-primary absolute top-0 left-0 flex size-9 items-center justify-center text-xs font-bold">
                {score}
              </span>
            </div>
            <span className="text-primary hidden text-xs uppercase lg:inline">
              {t('resourceBar.glory')}
            </span>
          </Tooltip>
          <Divider orientation="vertical" />
          <Button
            onClick={() => setStickerStockOpen(true)}
            variant="outlined"
            size="xs"
            title={t('stickerStock.open')}
            data-tour="sticker-stock-button"
          >
            🏷
          </Button>
        </div>
      </div>
      <StickerStockModal />
    </div>
  );
}
