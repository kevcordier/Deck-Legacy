import { type SyncStatus, getSyncStatus, subscribeSyncStatus } from '@services/sync';
import { useSyncExternalStore } from 'react';

/** Current status of the background sync of the local save. */
export function useSyncStatus(): SyncStatus {
  return useSyncExternalStore(subscribeSyncStatus, getSyncStatus, getSyncStatus);
}
