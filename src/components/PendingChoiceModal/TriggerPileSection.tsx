import { makePreviewInstance } from './shared';
import { GameCard } from '@components/GameCard/GameCard';
import { Button } from '@components/ui/Button/Button';
import { TriggerIcon } from '@components/ui/Icon/icon';
import type { CardDef, CardInstance, TriggerEntry } from '@engine/domain/types';
import { tCardEffectLabel, tCardName } from '@helpers/cardI18n';
import type { TFunction } from 'i18next';

type TriggerPileSectionProps = {
  triggerPile: Record<string, TriggerEntry>;
  defs: Record<number, CardDef>;
  instances: Record<number, CardInstance>;
  t: TFunction;
  onResolveTrigger: (sourceInstanceId: number, actionId: string, triggerId: string) => void;
  onSkipTrigger: (uuid: string) => void;
};

export function TriggerPileSection({
  triggerPile,
  defs,
  instances,
  t,
  onResolveTrigger,
  onSkipTrigger,
}: Readonly<TriggerPileSectionProps>) {
  return (
    <div className="flex flex-wrap gap-4">
      {Object.entries(triggerPile).map(([triggerId, trigger]) => {
        const inst = instances[trigger.sourceInstanceId];
        const def = inst ? defs[inst.cardId] : undefined;
        const state =
          def?.states.find(candidate => candidate.id === inst?.stateId) ?? def?.states[0];
        if (!inst || !def || !state) return null;
        const cardName = tCardName(t, state?.name || '');
        const actionLabel = tCardEffectLabel(t, `${trigger.effectDef.id}_1`, inst.cumulated);

        return (
          <div key={triggerId} className="flex flex-col items-center gap-2">
            <div className="flex min-w-56 flex-1 items-start gap-3">
              <TriggerIcon
                className="mt-1 size-8 shrink-0"
                color={trigger.effectDef.optional ? 'yellow' : 'red'}
              />
              <div className="flex-1">
                {cardName && (
                  <div className="font-display text-primary mb-1 text-sm font-semibold">
                    #{trigger.sourceInstanceId} {cardName}
                  </div>
                )}
                <div className="font-display text-ink text-xs">{actionLabel}</div>
              </div>
            </div>
            <div className="w-full max-w-56 shrink-0">
              <GameCard
                instance={makePreviewInstance(trigger.sourceInstanceId, def, state)}
                hideStatePreview
              />
            </div>
            <div className="flex flex-wrap items-end gap-2">
              <Button
                size="sm"
                color="base-primary"
                onClick={() =>
                  onResolveTrigger(trigger.sourceInstanceId, trigger.effectDef.id, triggerId)
                }
              >
                {t('triggerPile.resolve')}
              </Button>
              {trigger.effectDef.optional && (
                <Button
                  size="sm"
                  variant="outlined"
                  color="ink"
                  onClick={() => onSkipTrigger(triggerId)}
                >
                  {t('triggerPile.skip')}
                </Button>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
