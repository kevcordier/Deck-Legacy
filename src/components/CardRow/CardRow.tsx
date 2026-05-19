import { GameCard } from '@components/GameCard/GameCard';
import { PassifIcon } from '@components/ui/Icon/icon';
import { DragDropProvider } from '@dnd-kit/react';
import { useSortable } from '@dnd-kit/react/sortable';
import { cardSelector } from '@engine/application/cardSelector';
import { PassiveType } from '@engine/domain/enums';
import type { CardDef, GameState, Passive, Sticker } from '@engine/domain/types';
import { useGame } from '@hooks/useGame';
import { useTranslation } from 'react-i18next';

interface CardRowProps {
  readonly cardIds: number[];
  readonly onReorder?: (newOrder: number[]) => void;
}

type EffectEntry = { sourceId: number; passive: Passive };

const STACK_OFFSET_PX = 36;

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

type CardProps = {
  readonly id: number;
  readonly index: number;
  readonly blockingMap: Record<number, number[]>;
  readonly sortableGroup: string;
};

function Card({ id, index, blockingMap, sortableGroup }: CardProps) {
  const { gameState, defs, stickerDefs } = useGame();
  const { t } = useTranslation();
  const { ref } = useSortable({ id, index, group: sortableGroup });
  const inst = gameState.instances[id];
  if (!inst) return null;

  const blockedCardIds = blockingMap[id] ?? [];
  const blockedInsts = blockedCardIds.map(bid => gameState.instances[bid]);

  const effects = effectsOnCard(gameState, id, defs, stickerDefs).filter(
    ({ passive }) => ![PassiveType.STAY_IN_PLAY].includes(passive.type),
  );
  const effectLabel = (type: PassiveType): string => {
    if (type === PassiveType.BLOCK) return t('card.blocked');
    if (type === PassiveType.ADJUST_GLORY) return t('card.increaseGlory');
    if (type === PassiveType.RESOURCE_EQUIVALENCE) return t('card.resourceEquivalence');
    return t('card.adjustProduction');
  };

  return (
    <div key={id} className={`@container shrink-0`} ref={ref}>
      <div
        className="relative"
        style={{ paddingTop: `${blockedInsts.length * STACK_OFFSET_PX}px` }}
      >
        {blockedInsts.map((blockedInst, i) => (
          <div
            key={blockedInst.id}
            className="absolute inset-x-0 z-0"
            style={{ top: `${i * STACK_OFFSET_PX}px` }}
          >
            <GameCard instance={blockedInst} isOnBoard />
          </div>
        ))}
        <div className="relative z-10">
          <GameCard instance={inst} isOnBoard />
        </div>
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
}

export function CardRow({ cardIds }: CardRowProps) {
  const { gameState, defs, stickerDefs } = useGame();

  const blockingMap: Record<number, number[]> = {};
  Object.entries(gameState.boardEffects).forEach(([sourceId, passives]) => {
    passives
      .filter(be => be.type === PassiveType.BLOCK)
      .forEach(be => {
        const targets = be.cards
          ? cardSelector(be.cards, Number(sourceId), gameState, defs, stickerDefs)
          : [];
        if (targets.length > 0) {
          const sid = Number(sourceId);
          blockingMap[sid] = [...(blockingMap[sid] ?? []), ...targets];
        }
      });
  });

  const blockedIds = new Set(Object.values(blockingMap).flat());
  const visibleCardIds = cardIds.filter(id => !blockedIds.has(id));

  const sortableGroup = `card-row-${visibleCardIds.join('-')}`;

  return (
    <DragDropProvider>
      <div
        className={
          'grid grid-cols-1 gap-2 @xs/main:gap-3 @xs/main:grid-cols-2 @3xl/main:grid-cols-3 @5xl/main:grid-cols-4 @7xl/main:grid-cols-5 @8xl/main:grid-cols-6'
        }
      >
        {visibleCardIds.map((id, index) => (
          <Card
            key={id}
            id={id}
            index={index}
            blockingMap={blockingMap}
            sortableGroup={sortableGroup}
          />
        ))}
      </div>
    </DragDropProvider>
  );
}
