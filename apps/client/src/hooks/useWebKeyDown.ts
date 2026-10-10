import { useEffect } from 'react';
import { Platform } from 'react-native';

/** Subscribes to window `keydown` events on web; no-op on native platforms. */
export function useWebKeyDown(handler: (event: KeyboardEvent) => void, enabled = true): void {
  useEffect(() => {
    if (Platform.OS !== 'web' || !enabled) return;
    globalThis.addEventListener('keydown', handler);
    return () => globalThis.removeEventListener('keydown', handler);
  }, [handler, enabled]);
}
