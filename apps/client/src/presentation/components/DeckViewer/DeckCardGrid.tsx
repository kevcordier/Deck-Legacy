import { CardViewerModal } from '@components/CardViewerModal/CardViewerModal';
import { GameCard } from '@components/GameCard/GameCard';
import { MiniGameCard } from '@components/MiniGameCard/MiniGameCard';
import { Grid } from '@components/ui/Grid/Grid';
import type { CardInstance } from '@deck-legacy/engine/domain/types';
import { useIsDesktop } from '@hooks/useIsDesktop';
import { useState } from 'react';

/**
 * Cards of the full list (side sheets). Desktop: up to four columns; phone: mini cards, at least two per
 * row. A tap opens the card in large; the viewer steps through the list in its order.
 */
export function DeckCardGrid({ cards }: { readonly cards: CardInstance[] }) {
  const isDesktop = useIsDesktop();
  const [viewerCardId, setViewerCardId] = useState<number | null>(null);

  return (
    <>
      {isDesktop ? (
        <Grid minItemWidth={200} maxColumns={4}>
          {cards.map(inst => (
            <GameCard key={inst.id} instance={inst} onPress={() => setViewerCardId(inst.id)} />
          ))}
        </Grid>
      ) : (
        <Grid minItemWidth={140} maxColumns={4} gap={8}>
          {cards.map(inst => (
            <MiniGameCard key={inst.id} instance={inst} onPress={() => setViewerCardId(inst.id)} />
          ))}
        </Grid>
      )}
      {viewerCardId !== null && (
        <CardViewerModal
          cardIds={cards.map(inst => inst.id)}
          initialId={viewerCardId}
          onClose={() => setViewerCardId(null)}
        />
      )}
    </>
  );
}
