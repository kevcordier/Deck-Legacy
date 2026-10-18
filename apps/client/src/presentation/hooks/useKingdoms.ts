import { kingdomStore } from '@composition/kingdomStore';
import type { KingdomMeta } from '@domain/kingdom/KingdomMeta';
import { useSyncExternalStore } from 'react';

/** Kingdoms saved on this device, most recently created first. */
export function useKingdoms(): KingdomMeta[] {
  return useSyncExternalStore(kingdomStore.subscribe, kingdomStore.list, kingdomStore.list);
}
