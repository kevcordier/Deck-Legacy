import { FilterableCardGrid } from '@components/DeckViewer/DeckViewer';
import { Modal } from '@components/ui/Modal/Modal';
import { Text } from '@components/ui/Text/Text';
import { GameProvider } from '@contexts/GameProvider';
import { useGame } from '@hooks/useGame';
import { type KingdomMeta, loadSave } from '@services/persistence';
import { useState } from 'react';
import { ErrorBoundary } from 'react-error-boundary';
import { useTranslation } from 'react-i18next';

type KingdomViewerProps = {
  readonly kingdom: KingdomMeta;
  readonly onClose: () => void;
};

/** All the kingdom's cards in one list, sorted by id (hides the draw order), with search and tag filter. */
function KingdomCards({ kingdom, onClose }: KingdomViewerProps) {
  const { t } = useTranslation();
  const { gameState } = useGame();
  const { board, permanents, drawPile, discardPile, instances } = gameState;
  const cards = [...board, ...permanents, ...drawPile, ...discardPile]
    .sort((a, b) => a - b)
    .map(id => instances[id])
    .filter(Boolean);

  return (
    <Modal
      title={kingdom.name}
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

/**
 * Shows the cards of a kingdom from the home page, replaying its local save without playing
 * it (nothing is saved). A kingdom without a save shows empty zones.
 */
export function KingdomViewer({ kingdom, onClose }: KingdomViewerProps) {
  const { t } = useTranslation();
  const [save] = useState(() => loadSave(kingdom.id));
  return (
    <ErrorBoundary
      fallback={
        <Modal title={kingdom.name} onClose={onClose}>
          <Text>{t('errors.boundary.corruptedSave')}</Text>
        </Modal>
      }
    >
      {/* Without a save, no kingdom id: the provider would start (and save) its first game. */}
      <GameProvider kingdomId={save ? kingdom.id : undefined} initialSave={save}>
        <KingdomCards kingdom={kingdom} onClose={onClose} />
      </GameProvider>
    </ErrorBoundary>
  );
}
