/**
 * Runtime polyfills for React Native. Must be imported before anything else (see index.ts).
 *
 * Hermes (iOS/Android) has no Web Crypto global, while the engine relies on
 * `crypto.randomUUID()` for event and trigger ids. Browsers and Node already provide it.
 */
import { randomUUID } from 'expo-crypto';

const globalWithCrypto = globalThis as { crypto?: Partial<Crypto> };

if (typeof globalWithCrypto.crypto?.randomUUID !== 'function') {
  globalWithCrypto.crypto = {
    ...globalWithCrypto.crypto,
    randomUUID: randomUUID as Crypto['randomUUID'],
  };
}
