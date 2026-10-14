import { DeckCardGrid } from '@components/DeckViewer/DeckViewer';
import { Modal } from '@components/ui/Modal/Modal';
import { Text } from '@components/ui/Text/Text';
import { Title } from '@components/ui/Title/Title';
import { GameProvider } from '@contexts/GameProvider';
import { useGame } from '@hooks/useGame';
import { type KingdomMeta, loadSave } from '@services/persistence';
import { useState } from 'react';
import { ErrorBoundary } from 'react-error-boundary';
import { useTranslation } from 'react-i18next';
import { View } from 'react-native';

type KingdomViewerProps = {
  readonly kingdom: KingdomMeta;
  readonly onClose: () => void;
};

/** The kingdom's cards by zone: tableau, permanents, draw pile (sorted, order hidden), discard. */
function KingdomCards({ kingdom, onClose }: KingdomViewerProps) {
  const { t } = useTranslation();
  const { gameState } = useGame();
  const { board, permanents, drawPile, discardPile, instances } = gameState;
  const zones = [
    { key: 'sections.tableau', ids: board },
    { key: 'sections.permanents', ids: permanents },
    { key: 'deckViewer.draw', ids: [...drawPile].sort((a, b) => a - b) },
    { key: 'deckViewer.discard', ids: discardPile },
  ];
  const count = zones.reduce((total, zone) => total + zone.ids.length, 0);

  return (
    <Modal
      title={kingdom.name}
      subtitle={t('deckViewer.modalSubtitle', { count })}
      onClose={onClose}
    >
      <View className="gap-6">
        {zones.map(zone => (
          <View key={zone.key} className="gap-2">
            <Title level={4}>{`${t(zone.key)} (${zone.ids.length})`}</Title>
            {zone.ids.length > 0 ? (
              <DeckCardGrid cards={zone.ids.map(id => instances[id]).filter(Boolean)} />
            ) : (
              <Text className="text-ink/50 font-body-italic text-sm">{t('deckViewer.empty')}</Text>
            )}
          </View>
        ))}
      </View>
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
