import { GameEventType } from '../../domain/enums';
import type { CardDef, GameEvent, GameState, SkipTriggerEvent, Sticker } from '../../domain/types';
import type { GameEventStrategy } from './GameEventStrategy';
import { RoundEndedStrategy } from './RoundEndedStrategy';
import { TurnEndedStrategy } from './TurnEndedStrategy';

export class SkipTriggerStrategy implements GameEventStrategy {
  constructor(
    private readonly cardDefs: Record<number, CardDef>,
    private readonly stickerDefs: Record<number, Sticker>,
  ) {}
  apply(gameState: GameState, event: GameEvent): GameState {
    const e = event as SkipTriggerEvent;
    const { [e.triggerId]: _skipped, ...restTriggers } = gameState.triggerPile;
    const newGameState = { ...gameState, triggerPile: restTriggers };

    if (e.endTurn) {
      return new TurnEndedStrategy(this.cardDefs, this.stickerDefs).apply(newGameState, {
        id: '',
        type: GameEventType.TURN_ENDED,
        timestamp: Date.now(),
        endTurnTrigger: {},
      } as GameEvent);
    }

    if (e.endRound) {
      return new RoundEndedStrategy().apply(newGameState, {
        id: '',
        type: GameEventType.ROUND_ENDED,
        timestamp: Date.now(),
        endRoundTriggers: {},
      } as GameEvent);
    }

    return newGameState;
  }
}
