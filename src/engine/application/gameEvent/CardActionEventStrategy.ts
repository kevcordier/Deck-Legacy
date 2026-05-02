import type { GameEventStrategy } from './GameEventStrategy';
import { TurnEndedStrategy } from '@engine/application/gameEvent/TurnEndedStrategy';
import type { CardActionEvent, CardDef, GameEvent, GameState, Sticker } from '@engine/domain/types';

export class CardActionEventStrategy implements GameEventStrategy {
  constructor(
    private readonly cardDefs: Record<number, CardDef>,
    private readonly stickerDefs: Record<number, Sticker>,
  ) {}

  apply(gameState: GameState, event: GameEvent): GameState {
    const e = event as CardActionEvent;

    const newState = { ...gameState, ...e.gameStateChanges };

    if (e.endsTurn) {
      return new TurnEndedStrategy(this.cardDefs, this.stickerDefs).apply(newState);
    }

    return newState;
  }
}
