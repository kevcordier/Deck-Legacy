import { CardViewerModal } from '@components/CardViewerModal/CardViewerModal';
import { GameCard } from '@components/GameCard/GameCard';
import { WIDE_CARD_MIN_WIDTH } from '@components/GameCard/gameCardConstants';
import type { CardInstance } from '@deck-legacy/engine/domain/types';
import { useState } from 'react';
import { View } from 'react-native';

/** One stacked card shows under the top card per this many cards in the pile. */
const CARDS_PER_STACK_LAYER = 4;

const MAX_STACK_LAYERS = 10;

/** Offset between two stacked cards (px). */
const STACK_LAYER_VERTICAL_OFFSET = 3;

const STACK_LAYER_HORIZONTAL_OFFSET = 1;

/** A card with the rest of its pile peeking out underneath: thicker as the pile grows. */
function StackedCard({
  instance,
  stackCount,
  onPress,
}: {
  readonly instance: CardInstance;
  readonly stackCount: number;
  readonly onPress: () => void;
}) {
  const [width, setWidth] = useState(0);
  const layers = Math.min(MAX_STACK_LAYERS, Math.ceil(stackCount / CARDS_PER_STACK_LAYER));
  // Same corners as the card on top, which rounds more once wide.
  const rounded = width >= WIDE_CARD_MIN_WIDTH ? 'rounded-xl' : 'rounded-md';
  return (
    <View
      className="w-full max-w-80"
      style={{
        paddingBottom: layers * STACK_LAYER_VERTICAL_OFFSET,
        paddingRight: layers * STACK_LAYER_HORIZONTAL_OFFSET,
      }}
      onLayout={event => setWidth(event.nativeEvent.layout.width)}
    >
      {Array.from({ length: layers }, (_, i) => layers - i).map(depth => (
        <View
          key={depth}
          className={`bg-card border-border absolute inset-x-0 border ${rounded}`}
          style={{
            top: depth * STACK_LAYER_VERTICAL_OFFSET,
            bottom: (layers - depth) * STACK_LAYER_VERTICAL_OFFSET,
            left: depth * STACK_LAYER_HORIZONTAL_OFFSET,
            right: (layers - depth) * STACK_LAYER_HORIZONTAL_OFFSET,
          }}
        />
      ))}
      <GameCard instance={instance} onPress={onPress} />
    </View>
  );
}

/**
 * Top cards of a pile, the last one stacked on the rest: in a column (side column) or a `row`
 * (phone board). A tap zooms the card; the viewer only steps through the cards shown.
 */
export function PileTop({
  cards,
  stackCount,
  row = false,
}: {
  readonly cards: CardInstance[];
  readonly stackCount: number;
  readonly row?: boolean;
}) {
  const [viewerCardId, setViewerCardId] = useState<number | null>(null);
  return (
    <View className={row ? 'flex-row items-start justify-center gap-2' : 'items-center gap-2 p-2'}>
      {cards.map((inst, index) => {
        const open = () => setViewerCardId(inst.id);
        const card =
          index === cards.length - 1 ? (
            <StackedCard instance={inst} stackCount={stackCount} onPress={open} />
          ) : (
            <GameCard instance={inst} onPress={open} />
          );
        return row ? (
          <View key={inst.id} className="max-w-56 flex-1">
            {card}
          </View>
        ) : (
          <View key={inst.id} className="w-full items-center">
            {card}
          </View>
        );
      })}
      {viewerCardId !== null && (
        <CardViewerModal
          cardIds={cards.map(inst => inst.id)}
          initialId={viewerCardId}
          onClose={() => setViewerCardId(null)}
        />
      )}
    </View>
  );
}
