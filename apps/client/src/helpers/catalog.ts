import type { GameCatalog } from '@deck-legacy/engine/domain/types';
import { loadGameCatalog } from '@deck-legacy/game-data';

/** Card, sticker, deck and expansion definitions bundled with the app (available offline). */
export const catalog: GameCatalog = loadGameCatalog();
