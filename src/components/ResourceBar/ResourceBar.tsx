import { useTranslation } from 'react-i18next';
import { GloryIcon, IconColors } from '@components/ui/Icon';
import { useGame } from '@hooks/useGame';
import { Stat } from '@components/ui/Stat/Stat';
import { Divider } from '@components/ui/Divider/Divider';
import { ResourcePill } from '@components/ResourcePill/ResourcePill';

export function ResourceBar() {
  const { t } = useTranslation();
  const { state, score } = useGame();

  const { resources, round, turn, drawPile, discardPile } = state;
  const entries = Object.entries(resources).filter(([, v]) => v > 0);

  return (
    <div className="bg-background border-b-border z-100 flex items-stretch gap-6 border-b px-6 py-2">
      <div className="flex items-stretch gap-4">
        <Stat label={t('resourceBar.round')} value={round || '—'} />
        <Divider />
        <Stat label={t('resourceBar.turn')} value={turn || '—'} />
      </div>

      <Divider />
      <div className="flex flex-1 flex-wrap items-center gap-4">
        {entries.length === 0 ? (
          <p className="text-sm text-gray-400 italic">{t('resourceBar.noResources')}</p>
        ) : (
          entries.map(([k, v]) => {
            return (
              <div
                key={k}
                className="border-border flex items-center gap-1 rounded border px-2 py-1"
              >
                <span className="font-display">{v}</span>
                <ResourcePill key={k} resource={k} size="sm" />
              </div>
            );
          })
        )}
      </div>

      <Divider />

      <div className="flex items-stretch gap-4">
        <Stat label={t('resourceBar.deck')} value={drawPile.length} />
        <Divider />
        <Stat label={t('resourceBar.discard')} value={discardPile.length} />
      </div>

      <Divider />

      <div className="flex items-center gap-2">
        <div className="relative">
          <GloryIcon color={IconColors.gold} className="size-8" />
          <span className="font-display text-primary absolute top-0 left-0 flex size-8 items-center justify-center text-sm font-bold">
            {score}
          </span>
        </div>
        <span className="text-primary text-xs uppercase">{t('resourceBar.glory')}</span>
      </div>
    </div>
  );
}
