import type { SyncStatus } from '@application/sync/SyncStatus';
import { syncService } from '@composition/syncService';
import { useSyncExternalStore } from 'react';

/** Current status of the background sync of the local save. */
export function useSyncStatus(): SyncStatus {
  return useSyncExternalStore(
    syncService.subscribeStatus,
    syncService.getStatus,
    syncService.getStatus,
  );
}
