import type { CardDef, CardInstance, GameState, Sticker } from '@engine/domain/types';
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
  lastAddedCards: [],
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
    cumulated: 0,
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

export function makeDefs(overrides?: Partial<CardDef>): Record<number, CardDef> {
  const def = makeDef(overrides);
  return { [def.id]: def };
}

export function makeStickerDefs(id: number = 1): Record<number, Sticker> {
  return {
    [id]: { id, production: 'gold' },
  };
}
