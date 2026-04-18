import {
  cardShouldStayInPlay,
  getActiveState,
  getTrackGlory,
} from '@engine/application/cardHelpers';
import type { ResourceType } from '@engine/domain/enums';
import type { CardDef, GameState, Resources, Sticker } from '@engine/domain/types';
import type { Phase } from '@engine/domain/types/Phase';

export const discardCards = (_gameState: GameState, cardIds: number[]): GameState => {
  const gameState = JSON.parse(JSON.stringify(_gameState)) as GameState;
  cardIds.forEach(cardId => {
    gameState.discoveryPile = gameState.discoveryPile.filter(c => c !== cardId);
    gameState.board = [...new Set(gameState.board.filter(c => c !== cardId))];
    gameState.drawPile = [...new Set(gameState.drawPile.filter(c => c !== cardId))];
    gameState.discardPile = [...new Set([...gameState.discardPile, cardId])];
    const { [cardId]: _discarded, ...restDiscardEffects } = gameState.boardEffects;
    gameState.boardEffects = restDiscardEffects;
  });
  return gameState;
};

export const drawCards = (_gameState: GameState, turnCards: number[]): GameState => {
  const gameState = JSON.parse(JSON.stringify(_gameState)) as GameState;
  gameState.drawPile = [...new Set(gameState.drawPile.filter(id => !turnCards.includes(id)))];
  gameState.board = [...new Set([...gameState.board, ...turnCards])];

  return gameState;
};

export const destroyCards = (_gameState: GameState, cardIds: number[]): GameState => {
  const gameState = JSON.parse(JSON.stringify(_gameState)) as GameState;
  cardIds.forEach(cardId => {
    gameState.discoveryPile = gameState.discoveryPile.filter(c => c !== cardId);
    gameState.board = [...new Set(gameState.board.filter(c => c !== cardId))];
    gameState.drawPile = [...new Set(gameState.drawPile.filter(c => c !== cardId))];
    gameState.discardPile = [...new Set(gameState.discardPile.filter(c => c !== cardId))];
    gameState.destroyedPile = [...new Set([...gameState.destroyedPile, cardId])];
    const { [cardId]: _destroyed, ...restDestroyEffects } = gameState.boardEffects;
    gameState.boardEffects = restDestroyEffects;
  });
  return gameState;
};

export const endTurn = (_gameState: GameState, cardDefs: Record<number, CardDef>): GameState => {
  const gameState = JSON.parse(JSON.stringify(_gameState)) as GameState;
  gameState.resources = {};

  const cardsToDiscard = gameState.board.filter(
    id => !cardShouldStayInPlay(id, gameState, cardDefs),
  );
  return { ...gameState, ...discardCards(gameState, cardsToDiscard) };
};

export const spendResources = (_gameState: GameState, resources: Resources): GameState => {
  const gameState = JSON.parse(JSON.stringify(_gameState)) as GameState;
  for (const [resourceKey, number] of Object.entries(resources)) {
    const key = resourceKey as ResourceType;
    const newValue = (gameState.resources[key] ?? 0) - number;
    if (newValue <= 0) {
      const { [key]: _spent, ...restResources } = gameState.resources;
      gameState.resources = restResources;
    } else {
      gameState.resources[key] = newValue;
    }
  }
  return gameState;
};

export function computeScore(
  state: GameState,
  defs: Record<number, CardDef>,
  stickers: Record<string, Sticker>,
): number {
  const allIds = [...state.drawPile, ...state.discardPile, ...state.board, ...state.permanents];
  return allIds.reduce((total, id) => {
    const instance = state.instances[id];
    if (!instance) return total;
    const cs = getActiveState(instance, defs);
    const stickerGlory =
      instance.stickers[instance.stateId]?.reduce((sum, s) => sum + (stickers[s]?.glory ?? 0), 0) ??
      0;
    const trackGlory = getTrackGlory(instance, cs);
    return total + (cs.glory ?? 0) + stickerGlory + trackGlory;
  }, 0);
}

export function getCurrentPhase(state: GameState): Phase {
  let phase: Phase = 'pregame';
  const isGameStarted = state.round > 0 || state.drawPile.length > 0;
  const deckEmpty = state.drawPile.length === 0;
  if (!isGameStarted) phase = 'pregame';
  else if (state.round === 0 && Object.keys(state.triggerPile).length > 0) phase = 'preround';
  else if (state.board.length === 0 && state.turn === 0 && !deckEmpty && state.round > 1)
    phase = 'roundpreview';
  else phase = 'playing';

  return phase;
}

export function mergeResources(a: Resources, b: Resources): Resources {
  const result = JSON.parse(JSON.stringify(a)) as Resources;
  for (const [k, v] of Object.entries(b)) {
    result[k as keyof Resources] = (result[k as keyof Resources] ?? 0) + v;
  }
  return result;
}
