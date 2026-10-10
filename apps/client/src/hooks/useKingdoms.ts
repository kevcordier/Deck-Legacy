import { type KingdomMeta, listKingdoms, subscribeKingdoms } from '@services/persistence';
import { useSyncExternalStore } from 'react';

/** Kingdoms saved on this device, most recently created first. */
export function useKingdoms(): KingdomMeta[] {
  return useSyncExternalStore(subscribeKingdoms, listKingdoms, listKingdoms);
}
