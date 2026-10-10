import { ErrorBoundary } from '@components/ui/ErrorBoundary/ErrorBoundary';
import { GameProvider } from '@contexts/GameProvider';
import { kingdomIdFromParam } from '@helpers/kingdom';
import { useGameUI } from '@hooks/useGameInterface';
import { useKingdoms } from '@hooks/useKingdoms';
import { Game } from '@pages/Game/Game';
import { loadSave } from '@services/persistence';
import { subscribeSaveReplaced } from '@services/sync';
import { Redirect, useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';

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

/** `/game/{slug}-{id}`: the game of one kingdom. */
export default function GameRoute() {
  const { kingdom: param } = useLocalSearchParams<{ kingdom: string }>();
  const kingdomId = kingdomIdFromParam(param);
  const kingdoms = useKingdoms();
  const [revision, setRevision] = useState(0);

  // The sync downloaded a newer version of this kingdom (played on another device).
  useEffect(
    () =>
      subscribeSaveReplaced(id => {
        if (id === kingdomId) setRevision(r => r + 1);
      }),
    [kingdomId],
  );

  if (!kingdomId || !kingdoms.some(k => k.id === kingdomId)) return <Redirect href="/" />;

  return (
    <ErrorBoundary kingdomId={kingdomId}>
      <KingdomGame key={`${kingdomId}:${revision}`} kingdomId={kingdomId} />
    </ErrorBoundary>
  );
}
