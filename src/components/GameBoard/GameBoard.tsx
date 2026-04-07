import { DeckViewer } from '@components/DeckViewer';
import { MainBoard } from '@components/MainBoard/MainBoard';
import { useGame } from '@hooks/useGame';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';

export function GameBoard() {
  const { t } = useTranslation();
  const { state, phase } = useGame();
  const { drawPile, discardPile, instances } = state;

  const nextCard = instances[drawPile[0]]; // top of draw pile

  const drawDeck = useMemo(() => {
    return [...drawPile]
      .map(id => instances[id])
      .filter(Boolean)
      .sort((a, b) => (a.id ?? 9999) - (b.id ?? 9999));
  }, [drawPile, instances]);

  const discardDeck = useMemo(() => {
    return [...discardPile].map(id => instances[id]).filter(Boolean);
  }, [discardPile, instances]);

  return (
    <div className="flex flex-1 items-stretch gap-4 overflow-hidden">
      {phase !== 'pregame' && (
        <DeckViewer
          title={t('deckViewer.draw')}
          emptyText={t('deckViewer.empty')}
          deck={drawDeck}
          displayedCard={nextCard}
        />
      )}

      <MainBoard />

      {phase !== 'pregame' && (
        <DeckViewer
          title={t('deckViewer.discard')}
          deck={discardDeck}
          displayedCard={discardDeck[0]}
        />
      )}
    </div>
  );
}
