import type { CardActionStrategy } from '@engine/application/cardAction/CardActionStrategy';
import { discoverCards } from '@engine/application/gameStateHelper';
import type { CardDef, GameState, ResolvedActionEffect, Sticker } from '@engine/domain/types';

export class DiscoverCardStrategy implements CardActionStrategy {
  constructor(
    private readonly cardDefs: Record<number, CardDef>,
    private readonly stickerDefs: Record<number, Sticker>,
  ) {}

  apply(gameState: GameState, payload: ResolvedActionEffect): GameState {
    const gs = JSON.parse(JSON.stringify(gameState)) as GameState;
    const ids = payload.instanceIds ?? [];
    return discoverCards(gs, ids, this.cardDefs, this.stickerDefs);
  }
}
