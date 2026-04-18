import { Divider } from '@components/ui/Divider/Divider';
import { GloryIcon } from '@components/ui/Icon/icon';
import { IconColors } from '@components/ui/Icon/iconColors';
import { ResourcePill } from '@components/ui/ResourcePill/ResourcePill';
import { Stat } from '@components/ui/Stat/Stat';
import { useGame } from '@hooks/useGame';
import { useTranslation } from 'react-i18next';

export function ResourceBar() {
  const { t } = useTranslation();
  const { state, score } = useGame();

  const { resources, round, turn, drawPile, discardPile } = state;
  const entries = Object.entries(resources).filter(([, v]) => v > 0);

  return (
    <div className="bg-background border-b-border scrollbar z-100 flex items-stretch justify-between gap-3 overflow-x-auto border-b px-3 py-1 lg:gap-6 lg:px-6 lg:py-2">
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
                <ResourcePill key={k} resource={k} size="sm" />
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
          <div className="flex items-center gap-1">
            <div className="relative">
              <GloryIcon color={IconColors.gold} className="size-7" />
              <span className="font-display text-primary absolute top-0 left-0 flex size-7 items-center justify-center text-xs font-bold">
                {score}
              </span>
            </div>
            <span className="text-primary hidden text-xs uppercase lg:inline">
              {t('resourceBar.glory')}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
