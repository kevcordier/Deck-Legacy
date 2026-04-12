import { GameCard } from '@components/GameCard/GameCard';
import type { CardInstance } from '@engine/domain/types';

interface CardRowProps {
  cardIds: number[];
  blockingCards: Record<number, number>;
  instances: Record<number, CardInstance>;
}

export function CardRow({ cardIds, blockingCards, instances }: CardRowProps) {
  const blockedIds = new Set(Object.values(blockingCards));
  const blockerIds = new Set(Object.keys(blockingCards).map(Number));

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
            ? Object.entries(blockingCards).find(([, v]) => v === id)
            : undefined;
          const blockerId = blockerEntry ? Number(blockerEntry[0]) : null;
          const blockerInst = blockerId !== null ? instances[blockerId] : null;
          if (isBlocked && blockerInst && blockerId !== null) {
            return (
              <div key={id} className={'relative mb-2 shrink-0'}>
                <GameCard instance={inst} isOnBoard index={index} />
                <GameCard
                  instance={blockerInst}
                  isOnBoard
                  className={'absolute! top-1 left-1 z-30 @sm/card-row:top-2 @sm/card-row:left-2'}
                  index={index}
                />
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
