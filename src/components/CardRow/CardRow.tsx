import { GameCard } from '@components/GameCard/GameCard';
import { PassifIcon } from '@components/ui/Icon/icon';
import { cardSelector } from '@engine/application/cardSelector';
import { PassiveType } from '@engine/domain/enums';
import type { CardDef, GameState, Passive, Sticker } from '@engine/domain/types';
import { useGame } from '@hooks/useGame';
import { useTranslation } from 'react-i18next';

interface CardRowProps {
  readonly cardIds: number[];
}

type EffectEntry = { sourceId: number; passive: Passive };

function effectsOnCard(
  gameState: GameState,
  instanceId: number,
  defs: Record<number, CardDef>,
  stickerDefs: Record<number, Sticker>,
): EffectEntry[] {
  return Object.entries(gameState.boardEffects).flatMap(([sourceId, passives]) =>
    passives
      .filter(
        be =>
          be.cards &&
          cardSelector(be.cards, Number(sourceId), gameState, defs, stickerDefs)?.includes(
            instanceId,
          ),
      )
      .map(passive => ({ sourceId: Number(sourceId), passive })),
  );
}

export function CardRow({ cardIds }: CardRowProps) {
  const { t } = useTranslation();
  const { state: gameState, defs, stickerDefs } = useGame();

  const blockedByMap: Record<number, number> = {};
  Object.entries(gameState.boardEffects).forEach(([sourceId, passives]) => {
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
        'grid grid-cols-1 gap-2 @xs/main:gap-3 @2xs/main:grid-cols-2 @3xl/main:grid-cols-3 @4xl/main:grid-cols-4 @7xl/main:grid-cols-5'
      }
    >
      {cardIds
        .filter(id => !blockerIds.has(id))
        .map((id, index) => {
          const inst = gameState.instances[id];
          if (!inst) return null;

          const isBlocked = blockedIds.has(id);
          const blockerId = blockedByMap[id] ?? null;
          const blockerInst = blockerId ? gameState.instances[blockerId] : null;
          const effects = effectsOnCard(gameState, id, defs, stickerDefs).filter(({ passive }) =>
            [PassiveType.STAY_IN_PLAY, PassiveType.BLOCK].includes(passive.type),
          );

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
                      className="font-body! flex items-center gap-1 last-of-type:rounded-b-md border px-3 py-2 text-xs text-base-ink backdrop-blur-sm border-black/40 bg-gray"
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
