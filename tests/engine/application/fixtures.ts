import type { CardDef, CardInstance, GameState } from '@engine/domain/types';
import { Phase } from '@engine/domain/types/Phase';

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
  lastAddedIds: [],
  lastDrawnCards: [],
  round: 0,
  turn: 0,
  phase: Phase.PREGAME,
};

export function makeState(overrides?: Partial<GameState>): GameState {
  return { ...EMPTY_STATE, ...overrides };
}

export function makeInstance(overrides?: Partial<CardInstance>): CardInstance {
  return {
    id: 1,
    cardId: 1,
    stateId: 1,
    stickers: {},
    trackProgress: [],
    cumulated: {},
    usedActionIds: [],
    ...overrides,
  };
}

export function makeDef(overrides?: Partial<CardDef>): CardDef {
  return {
    id: 1,
    name: 'Test Card',
    states: [{ id: 1, name: 'State 1' }],
    ...overrides,
  };
}
