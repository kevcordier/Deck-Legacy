import { CardViewerModal } from '@components/CardViewerModal/CardViewerModal';
import { GameCard } from '@components/GameCard/GameCard';
import { MiniGameCard } from '@components/MiniGameCard/MiniGameCard';
import { PassifIcon } from '@components/ui/Icon/icon';
import { DragDropProvider } from '@dnd-kit/react';
import { useSortable } from '@dnd-kit/react/sortable';
import { cardSelector } from '@engine/application/cardSelector';
import { PassiveType } from '@engine/domain/enums';
import type { CardDef, CardInstance, GameState, Passive, Sticker } from '@engine/domain/types';
import { isInteractiveElementClick } from '@helpers/domHelpers';
import { useGame } from '@hooks/useGame';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';

export type BoardZoomLevel = 0 | 1 | 2;

interface CardRowProps {
  readonly cardIds: number[];
  readonly zoom?: BoardZoomLevel;
}

type EffectEntry = { sourceId: number; passive: Passive };

const STACK_OFFSET_PX = 36;
const MINI_STACK_OFFSET_PX = 14;

const GRID_CLASS_BY_ZOOM: Record<BoardZoomLevel, string> = {
  0: 'lg:@md/main:grid-cols-1 lg:@lg/main:grid-cols-2 lg:@3xl/main:grid-cols-3 lg:@6xl/main:grid-cols-4 lg:@7xl/main:grid-cols-5 lg:@8xl/main:grid-cols-6',
  1: 'lg:@md/main:grid-cols-2 lg:@lg/main:grid-cols-3 lg:@3xl/main:grid-cols-4 lg:@6xl/main:grid-cols-5 lg:@7xl/main:grid-cols-6 lg:@8xl/main:grid-cols-7',
  2: 'lg:@md/main:grid-cols-3 lg:@lg/main:grid-cols-4 lg:@3xl/main:grid-cols-5 lg:@6xl/main:grid-cols-6 lg:@7xl/main:grid-cols-7 lg:@8xl/main:grid-cols-8',
};

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

type CardStackProps = {
  readonly inst: CardInstance;
  readonly blockedInsts: CardInstance[];
  readonly visibilityClass: string;
  readonly stackOffsetPx: number;
  readonly Visual: typeof GameCard | typeof MiniGameCard;
  readonly openViewerIfNotInteractive: (cardId: number) => (event: React.MouseEvent) => void;
  readonly openViewerOnKeyDown: (cardId: number) => (event: React.KeyboardEvent) => void;
};

function CardStack({
  inst,
  blockedInsts,
  visibilityClass,
  stackOffsetPx,
  Visual,
  openViewerIfNotInteractive,
  openViewerOnKeyDown,
}: CardStackProps) {
  return (
    <div
      className={`relative transition-transform duration-200 ease-out ${visibilityClass}`}
      style={{ paddingTop: `${blockedInsts.length * stackOffsetPx}px` }}
    >
      {blockedInsts.map((blockedInst, i) => (
        <div
          key={blockedInst.id}
          role="button"
          tabIndex={0}
          className="absolute inset-x-0 z-0 cursor-pointer"
          style={{ top: `${i * stackOffsetPx}px` }}
          onClick={openViewerIfNotInteractive(blockedInst.id)}
          onKeyDown={openViewerOnKeyDown(blockedInst.id)}
        >
          <Visual instance={blockedInst} isOnBoard allowTilt />
        </div>
      ))}
      <div
        role="button"
        tabIndex={0}
        className="relative z-10 cursor-pointer"
        onClick={openViewerIfNotInteractive(inst.id)}
        onKeyDown={openViewerOnKeyDown(inst.id)}
      >
        <Visual instance={inst} isOnBoard allowTilt />
      </div>
    </div>
  );
}

type CardProps = {
  readonly id: number;
  readonly index: number;
  readonly blockingMap: Record<number, number[]>;
  readonly sortableGroup: string;
  readonly onOpenViewer: (id: number) => void;
};

function Card({ id, index, blockingMap, sortableGroup, onOpenViewer }: CardProps) {
  const { gameState, defs, stickerDefs } = useGame();
  const { t } = useTranslation();
  const { ref } = useSortable({
    id,
    index,
    group: sortableGroup,
  });
  const inst = gameState.instances[id];
  if (!inst) return null;

  const blockedCardIds = blockingMap[id] ?? [];
  const blockedInsts = blockedCardIds.map(bid => gameState.instances[bid]);

  const effects = effectsOnCard(gameState, id, defs, stickerDefs);
  const effectLabel = (type: PassiveType, sourceId: number): string | null => {
    if (type === PassiveType.BLOCK) return t('card.blocked');
    if (type === PassiveType.ADJUST_GLORY) return t('card.increaseGlory');
    if (type === PassiveType.RESOURCE_EQUIVALENCE) return t('card.resourceEquivalence');
    if (type === PassiveType.ADJUST_PRODUCTION) return t('card.adjustProduction');
    if (type === PassiveType.STAY_IN_PLAY && sourceId !== id) return t('card.stayInPlay');
    return null;
  };

  const openViewerIfNotInteractive = (cardId: number) => (event: React.MouseEvent) => {
    if (isInteractiveElementClick(event)) return;
    onOpenViewer(cardId);
  };
  const openViewerOnKeyDown = (cardId: number) => (event: React.KeyboardEvent) => {
    if (isInteractiveElementClick(event)) return;
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      onOpenViewer(cardId);
    }
  };

  return (
    <div key={id} className={`@container shrink-0`} ref={ref}>
      <CardStack
        inst={inst}
        blockedInsts={blockedInsts}
        visibilityClass={`hidden lg:block`}
        stackOffsetPx={STACK_OFFSET_PX}
        Visual={GameCard}
        openViewerIfNotInteractive={openViewerIfNotInteractive}
        openViewerOnKeyDown={openViewerOnKeyDown}
      />
      <CardStack
        inst={inst}
        blockedInsts={blockedInsts}
        visibilityClass={`lg:hidden`}
        stackOffsetPx={MINI_STACK_OFFSET_PX}
        Visual={MiniGameCard}
        openViewerIfNotInteractive={openViewerIfNotInteractive}
        openViewerOnKeyDown={openViewerOnKeyDown}
      />

      {effects.length > 0 && (
        <div className="hidden flex-col justify-stretch lg:flex">
          {effects.map(
            ({ sourceId, passive: be }) =>
              effectLabel(be.type, sourceId) && (
                <span
                  key={`${sourceId}-${be.id}`}
                  className="font-body! flex items-center gap-1 last-of-type:rounded-b-md border px-3 py-2 text-xs text-base-ink backdrop-blur-sm border-black/40 bg-gray"
                >
                  <PassifIcon className="size-3" />
                  {effectLabel(be.type, sourceId)}
                </span>
              ),
          )}
        </div>
      )}
    </div>
  );
}

export function CardRow({ cardIds, zoom = 1 }: CardRowProps) {
  const { gameState, defs, stickerDefs } = useGame();
  const [viewerCardId, setViewerCardId] = useState<number | null>(null);

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
        className={`grid grid-cols-2 gap-2 lg:gap-3 @lg/main:grid-cols-3 @3xl/main:grid-cols-4 ${GRID_CLASS_BY_ZOOM[zoom]}`}
      >
        {visibleCardIds.map((id, index) => (
          <Card
            key={id}
            id={id}
            index={index}
            blockingMap={blockingMap}
            sortableGroup={sortableGroup}
            onOpenViewer={setViewerCardId}
          />
        ))}
      </div>

      {viewerCardId !== null && (
        <CardViewerModal
          cardIds={cardIds}
          initialId={viewerCardId}
          onClose={() => setViewerCardId(null)}
        />
      )}
    </DragDropProvider>
  );
}
