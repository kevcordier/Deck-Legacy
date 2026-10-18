import type { GameParameters } from '../types';

/** Base game parameters, before board effects and expansion overrides. */
export const DEFAULT_PARAMETERS: GameParameters = {
  displayedDrawDeckCards: 1,
  advanceCardDrawn: 2,
  turnCardDrawn: 4,
  discoverPerRound: 2,
};
