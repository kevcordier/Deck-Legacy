import { GameCard } from '@components/GameCard/GameCard';
import { PassifIcon } from '@components/ui/Icon/icon';
import { PassiveType } from '@engine/domain/enums';
import type { CardInstance, Passive } from '@engine/domain/types';
import { useTranslation } from 'react-i18next';

interface CardRowProps {
  readonly cardIds: number[];
  readonly instances: Record<number, CardInstance>;
  readonly boardEffects: Record<number, Passive[]>;
}

type EffectEntry = { sourceId: number; passive: Passive };

function effectsOnCard(boardEffects: Record<number, Passive[]>, instanceId: number): EffectEntry[] {
  return Object.entries(boardEffects).flatMap(([sourceId, passives]) =>
    passives
      .filter(be => be.cards?.ids?.includes(instanceId))
      .map(passive => ({ sourceId: Number(sourceId), passive })),
  );
}

export function CardRow({ cardIds, instances, boardEffects }: CardRowProps) {
  const { t } = useTranslation();

  const blockedByMap: Record<number, number> = {};
  Object.entries(boardEffects).forEach(([sourceId, passives]) => {
    passives
      .filter(be => be.type === PassiveType.BLOCK)
      .forEach(be => {
        be.cards?.ids?.forEach(blockedId => {
          blockedByMap[blockedId] = Number(sourceId);
        });
      });
  });

  const blockedIds = new Set(Object.keys(blockedByMap).map(Number));
  const blockerIds = new Set(Object.values(blockedByMap).map(Number));

  const effectLabel = (type: PassiveType): string => {
    if (type === PassiveType.BLOCK) return t('card.blocked');
    if (type === PassiveType.STAY_IN_PLAY) return t('card.stayInPlay');
    if (type === PassiveType.INCREASE_GLORY) return t('card.increaseGlory');
    return t('card.increaseProduction');
  };

  return (
    <div
      className={
        'grid grid-cols-1 gap-2 @xs/main:gap-3 @2xs/main:grid-cols-2 @3xl/main:grid-cols-3 @4xl/main:grid-cols-4'
      }
    >
      {cardIds
        .filter(id => !blockerIds.has(id))
        .map((id, index) => {
          const inst = instances[id];
          if (!inst) return null;

          const isBlocked = blockedIds.has(id);
          const blockerId = blockedByMap[id] ?? null;
          const blockerInst = blockerId ? instances[blockerId] : null;
          const effects = effectsOnCard(boardEffects, id);

          return (
            <div key={id} className="@container shrink-0">
              <div className="relative">
                <GameCard instance={inst} isOnBoard index={index} />
                {isBlocked && blockerInst && (
                  <div className="absolute inset-0 top-9 z-30">
                    <GameCard instance={blockerInst} isOnBoard index={index} />
                  </div>
                )}
              </div>

              {effects.length > 0 && (
                <div className="flex flex-col justify-stretch">
                  {effects.map(({ sourceId, passive: be }) => (
                    <span
                      key={`${sourceId}-${be.id}`}
                      className="font-body! flex items-center gap-1 last-of-type:rounded-b-md border px-3 py-2 text-xs text-base-ink backdrop-blur-sm border-black/40 bg-black/15"
                    >
                      <PassifIcon className="size-3" />
                      {effectLabel(be.type)}
                    </span>
                  ))}
                </div>
              )}
            </div>
          );
        })}
    </div>
  );
}
