import { Button } from '@components/ui/Button/Button';
import { ErrorBoundary } from '@components/ui/ErrorBoundary/ErrorBoundary';
import { Modal } from '@components/ui/Modal/Modal';
import { Text } from '@components/ui/Text/Text';
import { GameProvider } from '@contexts/GameProvider';
import { kingdomIdFromParam } from '@helpers/kingdom';
import { toast } from '@helpers/toast';
import { useGameUI } from '@hooks/useGameInterface';
import { useKingdoms } from '@hooks/useKingdoms';
import { useSyncStatus } from '@hooks/useSyncStatus';
import { Game } from '@pages/Game/Game';
import { loadSave } from '@services/persistence';
import { resolveConflict, subscribeSaveReplaced } from '@services/sync';
import { Redirect, useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { View } from 'react-native';

/** Opens the kingdom's local save; a new kingdom starts with the tutorial when it was chosen. */
function KingdomGame({ kingdomId }: { readonly kingdomId: string }) {
  const { tutorialEnabled } = useGameUI();
  const [save] = useState(() => loadSave(kingdomId));
  const [tutorial] = useState(() => tutorialEnabled && save === null);

  return (
    <GameProvider kingdomId={kingdomId} initialSave={save} startTutorial={tutorial}>
      <Game />
    </GameProvider>
  );
}

/** Another device synced this kingdom while this one has unsynced changes: keep one version. */
function ConflictModal({ kingdomId }: { readonly kingdomId: string }) {
  const { t } = useTranslation();
  const status = useSyncStatus();
  const [busy, setBusy] = useState(false);
  if (status !== 'conflict' || !loadSave(kingdomId)?.sync.conflict) return null;

  const keep = (version: 'server' | 'mine') => {
    setBusy(true);
    void resolveConflict(kingdomId, version).finally(() => setBusy(false));
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
  const [revision, setRevision] = useState(0);

  // The sync downloaded a newer version of this kingdom (played on another device).
  useEffect(
    () =>
      subscribeSaveReplaced(id => {
        if (id !== kingdomId) return;
        setRevision(r => r + 1);
        toast.info(t('sync.updatedElsewhere'));
      }),
    [kingdomId, t],
  );

  if (!kingdomId || !kingdoms.some(k => k.id === kingdomId)) return <Redirect href="/" />;

  return (
    <ErrorBoundary kingdomId={kingdomId}>
      <KingdomGame key={`${kingdomId}:${revision}`} kingdomId={kingdomId} />
      <ConflictModal kingdomId={kingdomId} />
    </ErrorBoundary>
  );
}
