import { getActiveState, getInstancesTriggerEffects } from '@engine/application/cardHelpers';
import { type Options, PassiveType, type ResourceType, Trigger } from '@engine/domain/enums';
import type { CardDef, GameState, Passive, Resources, Sticker } from '@engine/domain/types';

export const pickPermanentBoardEffects = (
  boardEffects: Record<number, Passive[]>,
  permanents: number[],
): Record<number, Passive[]> => {
  const permanentBoardEffects: Record<number, Passive[]> = {};
  for (const sourceId of permanents) {
    if (boardEffects[sourceId]) {
      permanentBoardEffects[sourceId] = boardEffects[sourceId];
    }
  }
  return permanentBoardEffects;
};

export const discardCards = (
  _gameState: GameState,
  cardIds: number[],
  cardDefs: Record<number, CardDef>,
  stickerDefs: Record<number, Sticker>,
): GameState => {
  const gameState = JSON.parse(JSON.stringify(_gameState)) as GameState;
  gameState.lastDiscardedCards = cardIds;
  getInstancesTriggerEffects(
    cardIds.map(id => gameState.instances[id]).filter(Boolean),
    cardDefs,
    stickerDefs,
    Trigger.ON_DISCARD,
    gameState,
  ).forEach(({ effectDef, sourceInstanceId }) => {
    gameState.triggerPile[crypto.randomUUID()] = { effectDef, sourceInstanceId };
  });
  cardIds.forEach(cardId => {
    if (gameState.destroyedPile.includes(cardId)) {
      return;
    }
    gameState.discoveryPile = gameState.discoveryPile.filter(c => c !== cardId);
    gameState.board = gameState.board.filter(c => c !== cardId);
    gameState.drawPile = gameState.drawPile.filter(c => c !== cardId);
    gameState.discardPile = [...new Set([...gameState.discardPile, cardId])];
    const { [cardId]: _discarded, ...restDiscardEffects } = gameState.boardEffects;
    gameState.boardEffects = restDiscardEffects;
  });
  return gameState;
};

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

  return gameState;
};

export const destroyCards = (_gameState: GameState, cardIds: number[]): GameState => {
  const gameState = JSON.parse(JSON.stringify(_gameState)) as GameState;
  cardIds.forEach(cardId => {
    gameState.discoveryPile = gameState.discoveryPile.filter(c => c !== cardId);
    gameState.board = gameState.board.filter(c => c !== cardId);
    gameState.drawPile = gameState.drawPile.filter(c => c !== cardId);
    gameState.permanents = gameState.permanents.filter(c => c !== cardId);
    gameState.discardPile = gameState.discardPile.filter(c => c !== cardId);
    gameState.destroyedPile = [...new Set([...gameState.destroyedPile, cardId])];
    const { [cardId]: _destroyed, ...restDestroyEffects } = gameState.boardEffects;
    gameState.boardEffects = restDestroyEffects;
  });
  return gameState;
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

export function mergeResources(a: Resources, b?: Resources): Resources {
  const result = JSON.parse(JSON.stringify(a)) as Resources;
  for (const [k, v] of Object.entries(b ?? {})) {
    result[k as keyof Resources] = (result[k as keyof Resources] ?? 0) + v;
  }
  return result;
}

export const syncInstancePassivesInBoardEffects = (
  _gameState: GameState,
  instanceId: number,
  cardDefs: Record<number, CardDef>,
): GameState => {
  const gameState = JSON.parse(JSON.stringify(_gameState)) as GameState;
  const instance = gameState.instances[instanceId];
  if (!instance) {
    return gameState;
  }

  const passives = getActiveState(instance, cardDefs)?.passives ?? [];
  if (passives.length === 0) {
    const { [instanceId]: _synced, ...restBoardEffects } = gameState.boardEffects;
    gameState.boardEffects = restBoardEffects;
    return gameState;
  }

  gameState.boardEffects[instanceId] = passives;
  return gameState;
};

export function computeGameStateDiff(before: GameState, after: GameState): Partial<GameState> {
  return Object.fromEntries(
    (Object.keys(after) as (keyof GameState)[])
      .filter(key => JSON.stringify(before[key]) !== JSON.stringify(after[key]))
      .map(key => {
        if (key === 'instances') {
          return [
            key,
            Object.fromEntries(
              Object.entries(after.instances).filter(
                ([id, inst]) =>
                  JSON.stringify(before.instances[Number(id)]) !== JSON.stringify(inst),
              ),
            ),
          ];
        }
        return [key, after[key]];
      }),
  );
}

export function canUseOptions(gameState: GameState, options: Options): boolean {
  return !Object.values(gameState.boardEffects).some(effect =>
    effect.some(p => p.type === PassiveType.DESACTIVATE_OPTION && p.options?.includes(options)),
  );
}
