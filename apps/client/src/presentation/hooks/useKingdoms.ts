import { useAppServices } from './useAppServices';
import type { KingdomMeta } from '@domain/kingdom/KingdomMeta';
import { useSyncExternalStore } from 'react';

/** Kingdoms saved on this device, most recently created first. */
export function useKingdoms(): KingdomMeta[] {
  const { kingdoms } = useAppServices();
  return useSyncExternalStore(kingdoms.subscribe, kingdoms.list, kingdoms.list);
}
