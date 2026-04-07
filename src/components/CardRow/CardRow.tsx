import { GameCard } from '@components/GameCard';
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
    <div className="flex flex-wrap gap-4">
      {cardIds.map(id => {
        if (blockerIds.has(id)) return null;
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
            <div
              key={id}
              className="w-[calc(var(--card-w) + 20px)] min-h-[calc(var(--card-h) + 50px)] relative shrink-0"
            >
              <GameCard instance={inst} isOnBoard />
              <GameCard
                instance={blockerInst}
                isOnBoard
                style={{ position: 'absolute', top: '30px', left: '10px', zIndex: 2 }}
              />
            </div>
          );
        }
        return (
          <div key={id}>
            <GameCard instance={inst} isOnBoard />
          </div>
        );
      })}
    </div>
  );
}
