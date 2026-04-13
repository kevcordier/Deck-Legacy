import { GameCard } from '@components/GameCard/GameCard';
import type { CardInstance } from '@engine/domain/types';

interface CardRowProps {
  cardIds: number[];
  blockedCards: Record<number, number>; // key = blockedId, value = blockerId
  instances: Record<number, CardInstance>;
}

export function CardRow({ cardIds, blockedCards, instances }: CardRowProps) {
  const blockedIds = new Set(Object.keys(blockedCards).map(Number));
  const blockerIds = new Set(Object.values(blockedCards).map(Number));

  return (
    <div
      className={
        'grid grid-cols-1 gap-2 @xs/main:gap-3 @xs/main:grid-cols-2 @2xl/main:grid-cols-3 @4xl/main:grid-cols-4'
      }
    >
      {cardIds
        .filter(id => !blockerIds.has(id))
        .map((id, index) => {
          const inst = instances[id];
          if (!inst) return null;
          const isBlocked = blockedIds.has(id);
          const blockerEntry = isBlocked
            ? Object.entries(blockedCards).find(([blockedId]) => Number(blockedId) === id)
            : undefined;
          const blockerId = blockerEntry ? Number(blockerEntry[1]) : null;
          const blockerInst = blockerId !== null ? instances[blockerId] : null;
          if (isBlocked && blockerInst && blockerId !== null) {
            return (
              <div key={id} className={'relative shrink-0'}>
                <GameCard instance={inst} isOnBoard index={index} />
                <div className={'absolute inset-1 z-30 @sm/card-row:inset-2'}>
                  <GameCard instance={blockerInst} isOnBoard index={index} />
                </div>
              </div>
            );
          }
          return (
            <div key={id} className={'relative shrink-0'}>
              <GameCard instance={inst} isOnBoard index={index} />
            </div>
          );
        })}
    </div>
  );
}
