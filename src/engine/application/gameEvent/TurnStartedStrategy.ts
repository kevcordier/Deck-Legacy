import type { GameEventStrategy } from './GameEventStrategy';
import { drawCards } from '@engine/application/gameStateHelper';
import { Phase } from '@engine/domain/enums';
import type {
  CardDef,
  GameEvent,
  GameState,
  Sticker,
  TurnStartedEvent,
} from '@engine/domain/types';

export class TurnStartedStrategy implements GameEventStrategy {
  constructor(
    private readonly cardDefs: Record<number, CardDef>,
    private readonly stickerDefs: Record<number, Sticker>,
  ) {}

  apply(gameState: GameState, event: GameEvent): GameState {
    const e = event as TurnStartedEvent;

    gameState.lastAddedCards = [];
    const afterDraw = drawCards(gameState, e.turnCards, this.cardDefs, this.stickerDefs);
    return {
      ...gameState,
      ...afterDraw,
      turn: e.turn,
      resources: {},
      phase: Phase.PLAYING,
    };
  }
}
