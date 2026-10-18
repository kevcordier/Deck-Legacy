import { getInstancesTriggerEffects } from '../cards/getInstancesTriggerEffects';
import { getActiveState } from '../cards/selection/getActiveState';
import { Trigger } from '../enums';
import type { CardDef, GameState, Sticker } from '../types';
import { discardCardsMissingRequirement } from './discardCardsMissingRequirement';

export const drawCards = (
  _gameState: GameState,
  turnCards: number[],
  cardDefs: Record<number, CardDef>,
  stickerDefs: Record<number, Sticker>,
): GameState => {
  const gameState = JSON.parse(JSON.stringify(_gameState)) as GameState;

  gameState.lastDrawnCards = turnCards;
  getInstancesTriggerEffects(
    turnCards.map(cardId => gameState.instances[cardId]),
    cardDefs,
    stickerDefs,
    Trigger.ON_PLAY,
    gameState,
  ).forEach(({ effectDef, sourceInstanceId }) => {
    gameState.triggerPile[crypto.randomUUID()] = { effectDef, sourceInstanceId };
  });
  turnCards.forEach(instanceId => {
    const passives = getActiveState(gameState.instances[instanceId], cardDefs)?.passives;
    if (!passives) return;
    passives.forEach(passive => {
      gameState.boardEffects[instanceId] = [...(gameState.boardEffects[instanceId] ?? []), passive];
    });
  });

  gameState.drawPile = gameState.drawPile.filter(id => !turnCards.includes(id));
  gameState.board = [...new Set([...gameState.board, ...turnCards])];
  gameState.resources = {};

  return discardCardsMissingRequirement(gameState, cardDefs, stickerDefs);
};
