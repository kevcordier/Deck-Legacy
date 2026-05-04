import type { GameEventStrategy } from './GameEventStrategy';
import { drawCards, endTurn } from '@engine/application/gameStateHelper';
import type {
  CardDef,
  GameEvent,
  GameState,
  Sticker,
  TurnStartedEvent,
} from '@engine/domain/types';
import { Phase } from '@engine/domain/types/Phase';

export class TurnStartedStrategy implements GameEventStrategy {
  constructor(
    private readonly cardDefs: Record<number, CardDef>,
    private readonly stickerDefs: Record<number, Sticker>,
  ) {}

  apply(gameState: GameState, event: GameEvent): GameState {
    const e = event as TurnStartedEvent;

    const afterDraw = drawCards(
      endTurn({ ...gameState, turn: e.turn }, this.cardDefs, this.stickerDefs),
      e.turnCards,
      this.cardDefs,
      this.stickerDefs,
    );
    return {
      ...gameState,
      ...afterDraw,
      resources: {},
      phase: Phase.PLAYING,
    };
  }
}
