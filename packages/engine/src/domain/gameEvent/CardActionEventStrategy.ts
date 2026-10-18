import { GameEventType } from '../enums';
import { environment } from '../environment/environment';
import type { CardActionEvent, CardDef, GameEvent, GameState, Sticker } from '../types';
import type { GameEventStrategy } from './GameEventStrategy';
import { RoundEndedStrategy } from './RoundEndedStrategy';
import { TurnEndedStrategy } from './TurnEndedStrategy';

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

    if (e.endTurn) {
      return new TurnEndedStrategy(this.cardDefs, this.stickerDefs).apply(newState, {
        id: '',
        type: GameEventType.TURN_ENDED,
        timestamp: environment.now(),
        endTurnTrigger: e.triggers,
      } as GameEvent);
    }

    if (e.endRound) {
      return new RoundEndedStrategy().apply(newState, {
        id: '',
        type: GameEventType.ROUND_ENDED,
        timestamp: environment.now(),
        endRoundTriggers: e.triggers,
      } as GameEvent);
    }

    return newState;
  }
}
