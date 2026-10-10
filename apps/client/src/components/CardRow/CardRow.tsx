import { SortableCardGrid } from './SortableCardGrid';
import { suppressDropClick } from './suppressDropClick';
import { CardTilt } from '@components/CardTilt/CardTilt';
import { CardViewerModal } from '@components/CardViewerModal/CardViewerModal';
import { GameCard } from '@components/GameCard/GameCard';
import { MiniGameCard } from '@components/MiniGameCard/MiniGameCard';
import { PassifIcon } from '@components/ui/Icon/icon';
import { Text } from '@components/ui/Text/Text';
import { cardSelector } from '@deck-legacy/engine/application/cardSelector';
import { PassiveType } from '@deck-legacy/engine/domain/enums';
import type {
  CardDef,
  CardInstance,
  GameState,
  Passive,
  Sticker,
} from '@deck-legacy/engine/domain/types';
import { mergeOrder } from '@helpers/mergeOrder';
import { useGame } from '@hooks/useGame';
import { useIsDesktop } from '@hooks/useIsDesktop';
import { type ReactNode, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { type LayoutChangeEvent, View } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withDelay,
  withTiming,
} from 'react-native-reanimated';
import type { GridDimensions } from 'react-native-reanimated-dnd';

export type BoardZoomLevel = 0 | 1 | 2;

interface CardRowProps {
  readonly cardIds: number[];
  readonly zoom?: BoardZoomLevel;
  /** Registers the first card as the tutorial card. */
  readonly tourTarget?: boolean;
}

type EffectEntry = { sourceId: number; passive: Passive };

const STACK_OFFSET_PX = 36;
const MINI_STACK_OFFSET_PX = 14;
/** Minimum card width per zoom level on desktop (replaces the container-query grid). */
const MIN_CARD_WIDTH_BY_ZOOM: Record<BoardZoomLevel, number> = { 0: 280, 1: 200, 2: 160 };
const MIN_MINI_CARD_WIDTH = 160;
/** Height / width of a card. */
const CARD_ASPECT_RATIO = 5 / 3;
const HOVERED_CELL_STYLE = { zIndex: 10 };
/** Drawn cards fly from the draw pile to their cell, one after the other: kept short, it runs every turn. */
const DRAW_DURATION_MS = 350;
const DRAW_STAGGER_MS = 80;

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
  readonly isDesktop: boolean;
  readonly tourTarget: boolean;
  readonly onOpenViewer: (cardId: number) => void;
  readonly onHoverChange: (hovered: boolean) => void;
  readonly tiltEnabled: boolean;
};

function CardStack({
  inst,
  blockedInsts,
  isDesktop,
  tourTarget,
  onOpenViewer,
  onHoverChange,
  tiltEnabled,
}: CardStackProps) {
  const stackOffsetPx = isDesktop ? STACK_OFFSET_PX : MINI_STACK_OFFSET_PX;
  // The card states stay visible in the card viewer, not on the board.
  const renderCard = (instance: CardInstance, onPress: () => void, tour = false) =>
    isDesktop ? (
      <GameCard instance={instance} isOnBoard tourTarget={tour} onPress={onPress} />
    ) : (
      <MiniGameCard instance={instance} isOnBoard tourTarget={tour} onPress={onPress} />
    );

  return (
    <View className="relative" style={{ paddingTop: blockedInsts.length * stackOffsetPx }}>
      {blockedInsts.map((blockedInst, i) => (
        <View
          key={blockedInst.id}
          className="absolute inset-x-0 z-0"
          style={{ top: i * stackOffsetPx }}
        >
          <CardTilt enabled={tiltEnabled} onHoverChange={onHoverChange}>
            {renderCard(blockedInst, () => onOpenViewer(blockedInst.id))}
          </CardTilt>
        </View>
      ))}
      <CardTilt className="relative z-10" enabled={tiltEnabled} onHoverChange={onHoverChange}>
        {renderCard(inst, () => onOpenViewer(inst.id), tourTarget)}
      </CardTilt>
    </View>
  );
}

type CardProps = {
  readonly id: number;
  readonly blockingMap: Record<number, number[]>;
  readonly isDesktop: boolean;
  readonly tourTarget: boolean;
  readonly onOpenViewer: (id: number) => void;
  readonly onHoverChange: (hovered: boolean) => void;
  readonly tiltEnabled: boolean;
};

function Card({
  id,
  blockingMap,
  isDesktop,
  tourTarget,
  onOpenViewer,
  onHoverChange,
  tiltEnabled,
}: CardProps) {
  const { gameState, defs, stickerDefs } = useGame();
  const { t } = useTranslation();
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
  const labelledEffects = effects
    .map(({ sourceId, passive }) => ({
      sourceId,
      passive,
      label: effectLabel(passive.type, sourceId),
    }))
    .filter(effect => effect.label !== null);

  return (
    <View>
      <CardStack
        inst={inst}
        blockedInsts={blockedInsts}
        isDesktop={isDesktop}
        tourTarget={tourTarget}
        onOpenViewer={onOpenViewer}
        onHoverChange={onHoverChange}
        tiltEnabled={tiltEnabled}
      />

      {isDesktop && labelledEffects.length > 0 && (
        <View className="max-w-80">
          {labelledEffects.map(({ sourceId, passive, label }, index) => (
            <View
              key={`${sourceId}-${passive.id}`}
              className={`bg-gray flex-row items-center gap-1 border border-black/40 px-3 py-2 ${index === labelledEffects.length - 1 ? 'rounded-b-md' : ''}`}
            >
              <PassifIcon className="text-base-ink size-3" />
              <Text className="text-base-ink text-xs">{label}</Text>
            </View>
          ))}
        </View>
      )}
    </View>
  );
}

type DrawMotion = { readonly x: number; readonly y: number; readonly delay: number };

type DrawnCardMotionProps = {
  /** Start offset from the card's cell, or null when the card was not just drawn. */
  readonly motion: DrawMotion | null;
  readonly onLayout: (event: LayoutChangeEvent) => void;
  readonly children: ReactNode;
};

/**
 * Moves a drawn card from the draw pile side (left of the first row) to its cell. It runs once,
 * when the card mounts: a re-render or a drag and drop does not replay it (a CSS `entering`
 * animation restarts on web when the cards are reordered).
 */
function DrawnCardMotion({ motion, onLayout, children }: DrawnCardMotionProps) {
  const reducedMotion = useReducedMotion();
  const [start] = useState(() => (reducedMotion ? null : motion));
  const x = useSharedValue(start?.x ?? 0);
  const y = useSharedValue(start?.y ?? 0);

  useEffect(() => {
    if (!start) return;
    const move = (to: number) =>
      withDelay(start.delay, withTiming(to, { duration: DRAW_DURATION_MS }));
    x.set(move(0));
    y.set(move(0));
  }, [start, x, y]);

  const style = useAnimatedStyle(() => ({
    transform: [{ translateX: x.value }, { translateY: y.value }],
  }));

  return (
    <Animated.View style={style} onLayout={onLayout}>
      {children}
    </Animated.View>
  );
}

export function CardRow({ cardIds, zoom = 1, tourTarget = false }: CardRowProps) {
  const { gameState, defs, stickerDefs, drawnCardIds } = useGame();
  const isDesktop = useIsDesktop();
  const [viewerCardId, setViewerCardId] = useState<number | null>(null);
  const [order, setOrder] = useState<number[]>([]);
  const [width, setWidth] = useState(0);
  const [heights, setHeights] = useState<Record<number, number>>({});
  const [hoveredId, setHoveredId] = useState<number | null>(null);
  const [draggedId, setDraggedId] = useState<number | null>(null);

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
  const orderedCardIds = mergeOrder(order, visibleCardIds);

  const minItemWidth = isDesktop ? MIN_CARD_WIDTH_BY_ZOOM[zoom] : MIN_MINI_CARD_WIDTH;
  const gap = isDesktop ? 12 : 8;
  const columns = Math.max(1, Math.floor((width + gap) / (minItemWidth + gap)));
  // Floored so rounding never pushes the last item of a row onto the next one.
  const itemWidth = Math.max(1, Math.floor((width - gap * (columns - 1)) / columns));
  // Every cell has the height of the tallest card (blocked stacks and effects make cards taller).
  const measuredHeights = orderedCardIds.map(id => heights[id] ?? 0);
  const itemHeight = Math.max(Math.ceil(itemWidth * CARD_ASPECT_RATIO), ...measuredHeights);

  const dimensions = useMemo<GridDimensions>(
    () => ({ columns, itemWidth, itemHeight, rowGap: gap, columnGap: gap }),
    [columns, itemWidth, itemHeight, gap],
  );

  const releaseClickRef = useRef<(() => void) | null>(null);
  const handleDragStart = useCallback((id: string) => {
    setDraggedId(Number(id));
    // The dragged card is lifted by the library: its hover no longer raises its cell.
    setHoveredId(null);
    releaseClickRef.current = suppressDropClick();
  }, []);
  const handleDrop = useCallback((orderedIds: string[]) => {
    // Gesture Handler also finalizes a plain tap, which never started a drag.
    if (!releaseClickRef.current) return;
    setDraggedId(null);
    releaseClickRef.current?.();
    releaseClickRef.current = null;
    setOrder(orderedIds.map(Number));
  }, []);

  // Leaving a card must not clear the hover a neighbour has just taken.
  const hoverFor = (cardId: number) => (hovered: boolean) =>
    setHoveredId(current => {
      if (hovered) return cardId;
      return current === cardId ? null : current;
    });

  const renderItem = (id: string, index: number) => {
    const cardId = Number(id);
    const drawIndex = drawnCardIds.indexOf(cardId);
    const column = index % columns;
    const row = Math.floor(index / columns);
    // Starts just left of the first row, where the draw pile is, then flies to its cell.
    const motion =
      drawIndex === -1
        ? null
        : {
            x: -(column + 1) * (itemWidth + gap),
            y: -row * (itemHeight + gap),
            delay: drawIndex * DRAW_STAGGER_MS,
          };
    return (
      <DrawnCardMotion
        motion={motion}
        onLayout={event => {
          const height = Math.ceil(event.nativeEvent.layout.height);
          setHeights(current =>
            current[cardId] === height ? current : { ...current, [cardId]: height },
          );
        }}
      >
        <Card
          id={cardId}
          blockingMap={blockingMap}
          isDesktop={isDesktop}
          tourTarget={tourTarget && index === 0}
          onOpenViewer={setViewerCardId}
          onHoverChange={hoverFor(cardId)}
          // The dragged card stays flat: the library already lifts it.
          tiltEnabled={draggedId !== cardId}
        />
      </DrawnCardMotion>
    );
  };

  return (
    <>
      <View className="w-full" onLayout={event => setWidth(event.nativeEvent.layout.width)}>
        {width > 0 && orderedCardIds.length > 0 && (
          <SortableCardGrid
            key={[...orderedCardIds].sort((a, b) => a - b).join(',')}
            ids={orderedCardIds.map(String)}
            dimensions={dimensions}
            renderItem={renderItem}
            // The hovered card is scaled by its tilt: keep it above the next cells.
            itemStyle={id => (Number(id) === hoveredId ? HOVERED_CELL_STYLE : undefined)}
            onDragStart={handleDragStart}
            onDrop={handleDrop}
          />
        )}
      </View>

      {viewerCardId !== null && (
        <CardViewerModal
          cardIds={cardIds}
          initialId={viewerCardId}
          onClose={() => setViewerCardId(null)}
        />
      )}
    </>
  );
}
