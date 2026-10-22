import { getTriggerEntries } from '../cards/getTriggerEntries';
import { getHeldByPermanents } from '../cards/selection/getHeldByPermanents';
import { Phase, Trigger } from '../enums';
import { pickPermanentBoardEffects } from '../state/pickPermanentBoardEffects';
import type { CardDef, GameEvent, GameState, RoundStartedEvent, Sticker } from '../types';
import type { GameEventStrategy } from './GameEventStrategy';

export class RoundStartedStrategy implements GameEventStrategy {
  constructor(
    private readonly cardDefs: Record<number, CardDef> = {},
    private readonly stickerDefs: Record<number, Sticker> = {},
  ) {}

  apply(gameState: GameState, event: GameEvent): GameState {
    const e = event as RoundStartedEvent;
    const addedCards = e.lastAddedCards ?? [];

    const started: GameState = {
      ...gameState,
      round: e.round,
      isLastRound:
        gameState.isLastRound ||
        (gameState.expansionMaxRound !== undefined && gameState.expansionMaxRound <= e.round),
      turn: 0,
      drawPile: e.newDrawPile,
      discoveryPile: gameState.discoveryPile.filter(id => !addedCards.includes(id)),
      lastAddedCards: addedCards,
      boardEffects: pickPermanentBoardEffects(gameState.boardEffects, gameState.permanents),
      discardPile: [],
      // Cards a permanent blocks (Quarantine) stay blocked, out of the deck.
      board: getHeldByPermanents(gameState),
      phase: Phase.ROUND_START,
    };
    // "Start of round" effects of the permanents, after the shuffle (Haunted Souls).
    const roundTriggers = getTriggerEntries(
      started.permanents,
      Trigger.START_OF_ROUND,
      started,
      this.cardDefs,
      this.stickerDefs,
    );
    return Object.keys(roundTriggers).length > 0
      ? { ...started, triggerPile: { ...started.triggerPile, ...roundTriggers } }
      : started;
  }
}
