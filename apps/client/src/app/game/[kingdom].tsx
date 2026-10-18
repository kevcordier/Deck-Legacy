import { Button } from '@components/ui/Button/Button';
import { ErrorBoundary } from '@components/ui/ErrorBoundary/ErrorBoundary';
import { Modal } from '@components/ui/Modal/Modal';
import { Text } from '@components/ui/Text/Text';
import { GameProvider } from '@contexts/GameProvider';
import { useAppServices } from '@hooks/useAppServices';
import { useGameUI } from '@hooks/useGameInterface';
import { useKingdoms } from '@hooks/useKingdoms';
import { useSyncStatus } from '@hooks/useSyncStatus';
import { Game } from '@pages/Game/Game';
import { kingdomIdFromParam } from '@presentation/routing/kingdomIdFromParam';
import { Redirect, useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { View } from 'react-native';

/**
 * Opens the kingdom's local save; a new kingdom starts with the tutorial when it was chosen, and
 * with the seed given at its creation (`?seed=`).
 */
function KingdomGame({ kingdomId }: { readonly kingdomId: string }) {
  const { kingdoms } = useAppServices();
  const { tutorialEnabled } = useGameUI();
  const { seed } = useLocalSearchParams<{ seed?: string }>();
  const [save] = useState(() => kingdoms.loadSave(kingdomId));
  const [tutorial] = useState(() => tutorialEnabled && save === null);

  return (
    <GameProvider kingdomId={kingdomId} initialSave={save} startTutorial={tutorial} seed={seed}>
      <Game />
    </GameProvider>
  );
}

/** Another device synced this kingdom while this one has unsynced changes: keep one version. */
function ConflictModal({ kingdomId }: { readonly kingdomId: string }) {
  const { t } = useTranslation();
  const { kingdoms, sync } = useAppServices();
  const status = useSyncStatus();
  const [busy, setBusy] = useState(false);
  if (status !== 'conflict' || !kingdoms.loadSave(kingdomId)?.sync.conflict) return null;

  const keep = (version: 'server' | 'mine') => {
    setBusy(true);
    void sync.resolveConflict(kingdomId, version).finally(() => setBusy(false));
  };

  return (
    <Modal
      title={t('sync.conflictTitle')}
      footer={
        <View className="flex-row flex-wrap justify-end gap-2">
          <Button size="md" color="ink" font="body" disabled={busy} onPress={() => keep('mine')}>
            {t('sync.keepMine')}
          </Button>
          <Button
            size="md"
            color="primary"
            font="body"
            disabled={busy}
            onPress={() => keep('server')}
          >
            {t('sync.keepServer')}
          </Button>
        </View>
      }
    >
      <Text>{t('sync.conflictBody')}</Text>
    </Modal>
  );
}

/** `/game/{slug}-{id}`: the game of one kingdom. */
export default function GameRoute() {
  const { kingdom: param } = useLocalSearchParams<{ kingdom: string }>();
  const kingdomId = kingdomIdFromParam(param);
  const kingdoms = useKingdoms();
  const { t } = useTranslation();
  const { sync, notifier } = useAppServices();
  const [revision, setRevision] = useState(0);

  // The sync downloaded a newer version of this kingdom (played on another device).
  useEffect(
    () =>
      sync.subscribeSaveReplaced(id => {
        if (id !== kingdomId) return;
        setRevision(r => r + 1);
        notifier.info(t('sync.updatedElsewhere'));
      }),
    [kingdomId, notifier, sync, t],
  );

  if (!kingdomId || !kingdoms.some(k => k.id === kingdomId)) return <Redirect href="/" />;

  return (
    <ErrorBoundary kingdomId={kingdomId}>
      <KingdomGame key={`${kingdomId}:${revision}`} kingdomId={kingdomId} />
      <ConflictModal kingdomId={kingdomId} />
    </ErrorBoundary>
  );
}
