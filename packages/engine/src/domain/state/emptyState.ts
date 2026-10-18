import { Phase } from '../enums';
import type { GameState } from '../types';

/** Blank game state, used before a game starts and as the base for replays. */
export const EMPTY_STATE: GameState = {
  instances: {},
  drawPile: [],
  discardPile: [],
  board: [],
  destroyedPile: [],
  permanents: [],
  resources: {},
  stickerStock: {},
  discoveryPile: [],
  boardEffects: {},
  triggerPile: {},
  lastAddedCards: [],
  lastDrawnCards: [],
  lastDiscardedCards: [],
  round: 0,
  turn: 0,
  isLastRound: false,
  phase: Phase.PRE_GAME,
  parameterOverrides: {},
  campaignScores: {},
  purgedCards: [],
  purgedGlory: [],
};
