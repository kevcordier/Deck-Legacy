import type { CardDef, CardInstance, GameState, ResolvedCost } from '@engine/domain/types';

export const makeInstance = (id: number, cardId: number, stateId: number): CardInstance => ({
  id,
  cardId,
  stateId,
  stickers: {},
  trackProgress: [],
  cumulated: 0,
});

export const makeCardState = (id: number, overrides: Partial<CardDef['states'][number]> = {}) => ({
  id,
  name: `State ${id}`,
  ...overrides,
});

export const makeDef = (id: number, states: CardDef['states'] = [makeCardState(1)]): CardDef => ({
  id,
  name: `Card ${id}`,
  states,
});

export const makeGameState = (overrides: Partial<GameState> = {}): GameState => ({
  instances: {},
  drawPile: [],
  discardPile: [],
  board: [],
  destroyedPile: [],
  permanents: [],
  blockingCards: {},
  resources: {},
  stickerStock: {},
  discoveryPile: [],
  triggerPile: {},
  lastAddedIds: [],
  round: 0,
  turn: 0,
  ...overrides,
});

export const makeEmptyResolvedCost = (): ResolvedCost => ({
  resources: {},
  discardedCardIds: [],
  destroyedCardIds: [],
});
