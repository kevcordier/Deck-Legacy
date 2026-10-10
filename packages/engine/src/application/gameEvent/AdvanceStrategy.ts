import type { AdvanceEvent, CardDef, GameEvent, GameState, Sticker } from '../../domain/types';
import { drawCards } from '../gameStateHelper';
import type { GameEventStrategy } from './GameEventStrategy';

export class AdvanceStrategy implements GameEventStrategy {
  constructor(
    private readonly cardDefs: Record<number, CardDef>,
    private readonly stickerDefs: Record<number, Sticker>,
  ) {}

  apply(gameState: GameState, event: GameEvent): GameState {
    const e = event as AdvanceEvent;
    return { ...gameState, ...drawCards(gameState, e.turnCards, this.cardDefs, this.stickerDefs) };
  }
}
