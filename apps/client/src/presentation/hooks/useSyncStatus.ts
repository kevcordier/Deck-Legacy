import { useAppServices } from './useAppServices';
import type { SyncStatus } from '@application/sync/SyncStatus';
import { useSyncExternalStore } from 'react';

/** Current status of the background sync of the local save. */
export function useSyncStatus(): SyncStatus {
  const { sync } = useAppServices();
  return useSyncExternalStore(sync.subscribeStatus, sync.getStatus, sync.getStatus);
}
