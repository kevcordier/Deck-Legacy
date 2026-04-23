import { getAffectedCardsByBoardEffects } from '@engine/application/cardHelpers';
import { type CardTag, PassiveType, TargetScope } from '@engine/domain/enums';
import type { CardDef, CardState, CardeSelector, GameState } from '@engine/domain/types';

const LOCATION_SCOPES = new Set([
  TargetScope.DECK,
  TargetScope.DRAWN,
  TargetScope.BOARD,
  TargetScope.DISCOVERY,
  TargetScope.DISCARD,
  TargetScope.BLOCKED,
  TargetScope.PERMANENTS,
  TargetScope.ANY,
]);

function addLocationScopeParts(
  locationScopes: TargetScope[],
  gameState: GameState,
  blockedInstanceIds: number[],
  parts: number[],
): void {
  if (locationScopes.includes(TargetScope.DECK)) parts.push(...gameState.drawPile);
  if (locationScopes.includes(TargetScope.DRAWN)) parts.push(...gameState.lastDrawnCards);
  if (locationScopes.includes(TargetScope.BOARD)) parts.push(...gameState.board);
  if (locationScopes.includes(TargetScope.DISCOVERY)) parts.push(...gameState.discoveryPile);
  if (locationScopes.includes(TargetScope.DISCARD)) parts.push(...gameState.discardPile);
  if (locationScopes.includes(TargetScope.BLOCKED)) parts.push(...blockedInstanceIds);
  if (locationScopes.includes(TargetScope.PERMANENTS))
    parts.push(...Object.values(gameState.permanents));
}

function buildCardPool(
  locationScopes: TargetScope[],
  gameState: GameState,
  blockedInstanceIds: number[],
): number[] {
  if (locationScopes.includes(TargetScope.ANY)) {
    return [
      ...gameState.drawPile,
      ...gameState.board,
      ...gameState.discardPile,
      ...Object.values(gameState.permanents),
    ];
  }

  if (locationScopes.length > 0) {
    const parts: number[] = [];
    addLocationScopeParts(locationScopes, gameState, blockedInstanceIds, parts);
    return parts;
  }

  return Object.values(gameState.instances).map(inst => inst.id);
}

function matchesAlignmentAndName(
  state: CardState,
  isFriendly: boolean,
  isEnemy: boolean,
  name: string | undefined,
): boolean {
  if (isFriendly && state.negative) return false;
  if (isEnemy && !state.negative) return false;
  if (name && state.name !== name) return false;
  return true;
}

function matchesTags(state: CardState, tags: CardTag[] | undefined): boolean {
  if (!tags || tags.length === 0) return true;
  return !!(state.tags && tags.every(tag => state.tags?.includes(tag)));
}

function matchesProductions(state: CardState, produces: string[] | undefined): boolean {
  if (!produces || produces.length === 0) return true;
  if (!state.productions || state.productions.length === 0) return false;
  return produces.some(r => state.productions?.some(prod => Object.keys(prod).includes(r)));
}

function matchesCardCriteria(
  id: number,
  instanceId: number,
  scope: TargetScope[] | undefined,
  blockedInstanceIds: number[],
  gameState: GameState,
  defs: Record<number, CardDef> | undefined,
  selector: CardeSelector,
  isFriendly: boolean,
  isEnemy: boolean,
  hasBlocked: boolean,
): boolean {
  if (!scope?.includes(TargetScope.SELF) && id === instanceId) return false;
  if (!hasBlocked && blockedInstanceIds.includes(id)) return false;

  const inst = gameState.instances[id];
  if (!inst || !defs) return false;

  const state = defs[inst.cardId]?.states.find(s => s.id === inst.stateId);
  if (!state) return false;

  const { tags, produces, name } = selector;

  if (!matchesAlignmentAndName(state, isFriendly, isEnemy, name)) return false;
  if (!matchesTags(state, tags)) return false;
  if (!matchesProductions(state, produces)) return false;

  return true;
}

/**
 * Filters cards matching the selector's constraints (scope, tags, produces, ids).
 */
export function cardSelector(
  selector: CardeSelector,
  instanceId: number,
  gameState: GameState,
  defs?: Record<number, CardDef>,
): number[] {
  const { scope, ids } = selector;

  if (ids) return ids;
  if (scope?.length === 1 && scope?.includes(TargetScope.SELF)) return [instanceId];

  if (scope?.includes(TargetScope.TOP_OF_DECK)) {
    const topCardId = gameState.drawPile[gameState.drawPile.length - 1];
    return topCardId ? [gameState.instances[topCardId].id] : [];
  }

  const blockedInstanceIds = Object.values(
    getAffectedCardsByBoardEffects(gameState, PassiveType.BLOCK),
  ).flat();

  const locationScopes = scope?.filter(s => LOCATION_SCOPES.has(s)) ?? [];
  const hasBlocked = scope?.includes(TargetScope.BLOCKED) ?? false;
  const isFriendly = scope?.includes(TargetScope.FRIENDLY) ?? false;
  const isEnemy = scope?.includes(TargetScope.ENEMY) ?? false;

  const pool = buildCardPool(locationScopes, gameState, blockedInstanceIds);

  return pool.filter(id =>
    matchesCardCriteria(
      id,
      instanceId,
      scope,
      blockedInstanceIds,
      gameState,
      defs,
      selector,
      isFriendly,
      isEnemy,
      hasBlocked,
    ),
  );
}
