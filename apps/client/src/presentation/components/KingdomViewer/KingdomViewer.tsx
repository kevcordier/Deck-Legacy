import { KingdomCards } from './KingdomCards';
import type { KingdomViewerProps } from './KingdomViewerProps';
import { Modal } from '@components/ui/Modal/Modal';
import { Text } from '@components/ui/Text/Text';
import { kingdomStore } from '@composition/kingdomStore';
import { GameProvider } from '@contexts/GameProvider';
import { useState } from 'react';
import { ErrorBoundary } from 'react-error-boundary';
import { useTranslation } from 'react-i18next';

/**
 * Shows the cards of a kingdom from the home page, replaying its local save without playing
 * it (nothing is saved). A kingdom without a save shows empty zones.
 */
export function KingdomViewer({ kingdom, onClose }: KingdomViewerProps) {
  const { t } = useTranslation();
  const [save] = useState(() => kingdomStore.loadSave(kingdom.id));
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
