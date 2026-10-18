import type { KingdomViewerProps } from './KingdomViewerProps';
import { FilterableCardGrid } from '@components/DeckViewer/FilterableCardGrid';
import { Modal } from '@components/ui/Modal/Modal';
import { Text } from '@components/ui/Text/Text';
import { useGame } from '@hooks/useGame';
import { useTranslation } from 'react-i18next';

/** All the kingdom's cards in one list, sorted by id (hides the draw order), with search and tag filter. */
export function KingdomCards({ kingdom, onClose }: KingdomViewerProps) {
  const { t } = useTranslation();
  const { gameState } = useGame();
  const { board, permanents, drawPile, discardPile, instances } = gameState;
  const cards = [...board, ...permanents, ...drawPile, ...discardPile]
    .sort((a, b) => a - b)
    .map(id => instances[id])
    .filter(Boolean);

  return (
    <Modal
      title={t('kingdom.titleOf', { name: kingdom.name })}
      subtitle={t('deckViewer.modalSubtitle', { count: cards.length })}
      onClose={onClose}
      wide
    >
      {cards.length > 0 ? (
        <FilterableCardGrid cards={cards} />
      ) : (
        <Text className="text-ink/50 font-body-italic p-2 text-center text-sm">
          {t('deckViewer.emptyDeck')}
        </Text>
      )}
    </Modal>
  );
}
