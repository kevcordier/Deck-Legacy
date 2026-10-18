import { Phase } from './enums';
import type { GameParameters, GameState } from './types';

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

/** Base game parameters, before board effects and expansion overrides. */
export const DEFAULT_PARAMETERS: GameParameters = {
  displayedDrawDeckCards: 1,
  advanceCardDrawn: 2,
  turnCardDrawn: 4,
  discoverPerRound: 2,
};
