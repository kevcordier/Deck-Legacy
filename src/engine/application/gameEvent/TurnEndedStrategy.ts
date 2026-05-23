import type { GameEventStrategy } from './GameEventStrategy';
import { cardShouldStayInPlay } from '@engine/application/cardHelpers';
import { discardCards } from '@engine/application/gameStateHelper';
import type {
  CardDef,
  GameEvent,
  GameState,
  Passive,
  Sticker,
  TurnEndedEvent,
} from '@engine/domain/types';
import { Phase } from '@engine/domain/types/Phase';

export class TurnEndedStrategy implements GameEventStrategy {
  constructor(
    private readonly cardDefs: Record<number, CardDef>,
    private readonly stickerDefs: Record<number, Sticker>,
  ) {}
  apply(_gameState: GameState, event: GameEvent): GameState {
    const e = event as TurnEndedEvent;
    const gameState = JSON.parse(JSON.stringify(_gameState)) as GameState;

    if (Object.keys(e.endTurnTrigger).length > 0) {
      gameState.triggerPile = { ...gameState.triggerPile, ...e.endTurnTrigger };

      return gameState;
    }

    // If there are still triggers pending, stay in PLAYING phase
    if (Object.keys(gameState.triggerPile).length > 0) {
      return gameState;
    }

    const cardsToDiscard = gameState.board.filter(
      id => !cardShouldStayInPlay(id, gameState, this.cardDefs),
    );

    const newBoardEffects: Record<number, Passive[]> = {};
    Object.keys(gameState.boardEffects).forEach((key: string) => {
      if (
        gameState.boardEffects[Number(key)] &&
        (gameState.board.includes(Number(key)) || gameState.permanents.includes(Number(key)))
      )
        newBoardEffects[Number(key)] = gameState.boardEffects[Number(key)];
    });

    gameState.boardEffects = newBoardEffects;
    return {
      ...gameState,
      ...discardCards(gameState, cardsToDiscard, this.cardDefs, this.stickerDefs),
      phase: Phase.TURN_END,
    };
  }
}
