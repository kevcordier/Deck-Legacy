import type { CardDef, GameState, ResolvedActionEffect, Sticker } from '../../domain/types';
import { discardCards } from '../gameStateHelper';
import type { CardActionStrategy } from './CardActionStrategy';

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
