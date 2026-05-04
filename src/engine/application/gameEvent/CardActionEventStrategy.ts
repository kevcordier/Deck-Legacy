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

    const { instances, ...dif } = e.gameStateChanges;

    const newState = { ...gameState, ...dif };
    if (instances) {
      Object.entries(instances).forEach(([id, inst]) => {
        newState.instances[Number(id)] = {
          ...newState.instances[Number(id)],
          ...inst,
        };
      });
    }

    if (e.endsTurn) {
      return new TurnEndedStrategy(this.cardDefs, this.stickerDefs).apply(newState);
    }

    return newState;
  }
}
