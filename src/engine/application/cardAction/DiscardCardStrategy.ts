import type { CardActionStrategy } from '@engine/application/cardAction/CardActionStrategy';
import { discardCards } from '@engine/application/gameStateHelper';
import type { CardDef, GameState, ResolvedActionEffect, Sticker } from '@engine/domain/types';

export class DiscardCardStrategy implements CardActionStrategy {
  constructor(
    private readonly cardDefs: Record<number, CardDef>,
    private readonly stickerDefs: Record<number, Sticker>,
  ) {}

  apply(gameState: GameState, payload: ResolvedActionEffect): GameState {
    const gs = JSON.parse(JSON.stringify(gameState)) as GameState;
    const instanceIds = payload.instanceIds ?? [];

    return { ...gs, ...discardCards(gs, instanceIds, this.cardDefs, this.stickerDefs) };
  }
}
