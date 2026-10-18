import { GameEventType } from '../enums';
import { environment } from '../environment/environment';
import type { CardDef, GameEvent, GameState, SkipTriggerEvent, Sticker } from '../types';
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
    const pile = gameState.triggerPile;
    // On replay the key differs: find the trigger by its source and action.
    const key =
      e.triggerId in pile || e.sourceInstanceId === undefined
        ? e.triggerId
        : (Object.keys(pile).find(
            k =>
              pile[k].sourceInstanceId === e.sourceInstanceId &&
              pile[k].effectDef.id === e.actionId,
          ) ?? e.triggerId);
    const { [key]: _skipped, ...restTriggers } = pile;
    const newGameState = { ...gameState, triggerPile: restTriggers };

    if (e.endTurn) {
      return new TurnEndedStrategy(this.cardDefs, this.stickerDefs).apply(newGameState, {
        id: '',
        type: GameEventType.TURN_ENDED,
        timestamp: environment.now(),
        endTurnTrigger: {},
      } as GameEvent);
    }

    if (e.endRound) {
      return new RoundEndedStrategy().apply(newGameState, {
        id: '',
        type: GameEventType.ROUND_ENDED,
        timestamp: environment.now(),
        endRoundTriggers: {},
      } as GameEvent);
    }

    return newGameState;
  }
}
