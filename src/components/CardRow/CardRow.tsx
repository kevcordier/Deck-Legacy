import { GameCard } from '@components/GameCard/GameCard';
import { useMediaQuery } from '@hooks/useMediaQuery';
import type { CardInstance } from '@engine/domain/types';

interface CardRowProps {
  cardIds: number[];
  blockingCards: Record<number, number>;
  instances: Record<number, CardInstance>;
}

export function CardRow({ cardIds, blockingCards, instances }: CardRowProps) {
  const isMobile = useMediaQuery('(max-width: 767px)');
  const blockedIds = new Set(Object.values(blockingCards));
  const blockerIds = new Set(Object.keys(blockingCards).map(Number));
  const cardSize = isMobile ? 'xs' : 'md';

  return (
    <div className={isMobile ? 'grid grid-cols-4 gap-2' : 'flex flex-wrap gap-4.5'}>
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
              <div
                key={id}
                className={
                  isMobile
                    ? 'relative min-h-36'
                    : 'w-[calc(var(--card-w) + 20px)] min-h-[calc(var(--card-h) + 50px)] relative shrink-0'
                }
              >
                <GameCard instance={inst} isOnBoard index={index} size={cardSize} />
                <GameCard
                  instance={blockerInst}
                  isOnBoard
                  className={
                    isMobile ? 'absolute! top-1 left-1 z-30 !w-full' : 'absolute! top-2 left-2 z-30'
                  }
                  index={index}
                  size={cardSize}
                />
              </div>
            );
          }
          return (
            <div key={id}>
              <GameCard instance={inst} isOnBoard index={index} size={cardSize} />
            </div>
          );
        })}
    </div>
  );
}
