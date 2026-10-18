import { getActiveState, getInstancesTriggerEffects } from './cardHelpers';
import { cardSelector } from './cardSelector';
import { type Options, PassiveType, type ResourceType, Trigger } from './enums';
import type { CardDef, GameParameters, GameState, Passive, Resources, Sticker } from './types';

export { mergeResources } from './resources';

/**
 * The round just played is the last one: marked as such, or (two packs, EDR-045) the campaign
 * pile holds fewer cards than the next round discovers.
 */
export const isLastRound = (gameState: GameState, parameters: GameParameters): boolean =>
  gameState.isLastRound ||
  (gameState.discoverablePile !== undefined &&
    gameState.discoveryPile.length < parameters.discoverPerRound);

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
    removeFromDiscovery(gameState, [cardId]);
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

  return discardCardsMissingRequirement(gameState, cardDefs, stickerDefs);
};

/** REQUIRES_IN_PLAY: a card in play is discarded as soon as no card matches its selector. */
export const discardCardsMissingRequirement = (
  gameState: GameState,
  cardDefs: Record<number, CardDef>,
  stickerDefs: Record<number, Sticker>,
): GameState => {
  const missing = Object.entries(gameState.boardEffects)
    .filter(
      ([sourceId, passives]) =>
        gameState.board.includes(Number(sourceId)) &&
        passives.some(
          p =>
            p.type === PassiveType.REQUIRES_IN_PLAY &&
            cardSelector(p.cards ?? {}, Number(sourceId), gameState, cardDefs, stickerDefs)
              .length === 0,
        ),
    )
    .map(([sourceId]) => Number(sourceId));
  return missing.length > 0 ? discardCards(gameState, missing, cardDefs, stickerDefs) : gameState;
};

export const destroyCards = (_gameState: GameState, cardIds: number[]): GameState => {
  const gameState = JSON.parse(JSON.stringify(_gameState)) as GameState;
  cardIds.forEach(cardId => {
    removeFromDiscovery(gameState, [cardId]);
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

/** Removes cards from the campaign and discoverable piles (mutates `gameState`). */
export function removeFromDiscovery(gameState: GameState, ids: readonly number[]): void {
  gameState.discoveryPile = gameState.discoveryPile.filter(id => !ids.includes(id));
  if (gameState.discoverablePile) {
    gameState.discoverablePile = gameState.discoverablePile.filter(id => !ids.includes(id));
  }
}

/**
 * The end of a game empties the campaign pile. Games started with a single discovery pile keep it:
 * it also holds the cards that effects discover later (EDR-045).
 */
export function clearCampaignPile(gameState: GameState): GameState {
  return gameState.discoverablePile ? { ...gameState, discoveryPile: [] } : gameState;
}

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
