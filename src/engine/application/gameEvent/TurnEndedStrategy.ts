import type { GameEventStrategy } from './GameEventStrategy';
import { cardShouldStayInPlay } from '@engine/application/cardHelpers';
import { discardCards } from '@engine/application/gameStateHelper';
import type { CardDef, GameState, Passive, Sticker } from '@engine/domain/types';
import { Phase } from '@engine/domain/types/Phase';

export class TurnEndedStrategy implements GameEventStrategy {
  constructor(
    private readonly cardDefs: Record<number, CardDef>,
    private readonly stickerDefs: Record<number, Sticker>,
  ) {}
  apply(_gameState: GameState): GameState {
    const gameState = JSON.parse(JSON.stringify(_gameState)) as GameState;
    gameState.resources = {};

    const cardsToDiscard = gameState.board.filter(
      id => !cardShouldStayInPlay(id, gameState, this.cardDefs),
    );

    const newBoardEffects: Record<number, Passive[]> = {};
    Object.keys(gameState.boardEffects).forEach((key: string) => {
      if (
        gameState.boardEffects[Number(key)] &&
        (gameState.board.includes(Number(key)) ||
          gameState.boardEffects[Number(key)].some(effect => effect.global === true))
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
