import {
  getAffectedCardsByBoardEffects,
  getEffectiveProductions,
} from '@engine/application/cardHelpers';
import { matchHaving } from '@engine/application/stateSelector';
import { type CardTag, PassiveType, TargetScope } from '@engine/domain/enums';
import type { CardDef, CardSelector, CardState, GameState, Sticker } from '@engine/domain/types';

const LOCATION_SCOPES = new Set([
  TargetScope.DECK,
  TargetScope.DRAWN,
  TargetScope.DISCARDED,
  TargetScope.BOARD,
  TargetScope.DISCOVERY,
  TargetScope.DISCARD,
  TargetScope.BLOCKED,
  TargetScope.PERMANENTS,
  TargetScope.PURGE_SELECTED,
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
  if (locationScopes.includes(TargetScope.DISCARDED)) parts.push(...gameState.lastDiscardedCards);
  if (locationScopes.includes(TargetScope.BOARD)) parts.push(...gameState.board);
  if (locationScopes.includes(TargetScope.DISCOVERY)) parts.push(...gameState.discoveryPile);
  if (locationScopes.includes(TargetScope.DISCARD)) parts.push(...gameState.discardPile);
  if (locationScopes.includes(TargetScope.BLOCKED)) parts.push(...blockedInstanceIds);
  if (locationScopes.includes(TargetScope.PERMANENTS))
    parts.push(...Object.values(gameState.permanents));
  if (locationScopes.includes(TargetScope.PURGE_SELECTED)) {
    parts.push(
      ...(gameState.purgeState?.selectedCardIds ?? []),
      ...(gameState.purgeState?.selectedPermanentIds ?? []),
    );
  }
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
  return !!(state.tags && tags.some(tag => state.tags?.includes(tag)));
}

function matchesProductions(
  id: number,
  state: CardState,
  produces: string[] | undefined,
  ctx: CardCriteriaContext,
): boolean {
  const { gameState, defs, stickerDefs } = ctx;
  if (!produces || produces.length === 0) return true;

  // Evaluate at least one base production to account for sticker-added production.
  const baseProductions = state.productions?.length ? state.productions : [{}];

  return produces.some(r =>
    baseProductions.some(prod => {
      const effectiveProduction = getEffectiveProductions(
        prod,
        gameState,
        defs,
        gameState.instances[id],
        stickerDefs,
        false,
      );
      return (effectiveProduction[r as keyof ReturnType<typeof getEffectiveProductions>] ?? 0) > 0;
    }),
  );
}

interface CardCriteriaContext {
  instanceId: number;
  scope: TargetScope[] | undefined;
  blockedInstanceIds: number[];
  gameState: GameState;
  defs: Record<number, CardDef>;
  stickerDefs: Record<number, Sticker>;
  selector: CardSelector;
  isFriendly: boolean;
  isEnemy: boolean;
  hasBlocked: boolean;
  isUpgradable: boolean;
  withTrack: boolean;
}

function hasAvailableTrackStep(state: CardState, trackProgress: number[]): boolean {
  return !!state.track && state.track.steps.some(step => !trackProgress.includes(step.id));
}

function hasIntrinsicCountAs2(
  id: number,
  gameState: GameState,
  defs: Record<number, CardDef>,
): boolean {
  const inst = gameState.instances[id];
  if (!inst) return false;
  const state = defs[inst.cardId]?.states.find(s => s.id === inst.stateId);
  if (!state?.passives?.length) return false;

  return state.passives.some(passive => passive.type === PassiveType.COUNT_AS_2);
}

function passesScopeConstraints(id: number, ctx: CardCriteriaContext): boolean {
  if (!ctx.scope?.includes(TargetScope.SELF) && id === ctx.instanceId) return false;
  if (!ctx.hasBlocked && ctx.blockedInstanceIds.includes(id)) return false;
  return true;
}

function matchesCardCriteria(id: number, ctx: CardCriteriaContext): boolean {
  if (!passesScopeConstraints(id, ctx)) return false;

  const inst = ctx.gameState.instances[id];
  if (!inst || !ctx.defs) return false;

  const state = ctx.defs[inst.cardId]?.states.find(s => s.id === inst.stateId);
  if (!state) return false;

  const { tags, produces, name } = ctx.selector;

  if (!matchesAlignmentAndName(state, ctx.isFriendly, ctx.isEnemy, name)) return false;
  if (!matchesTags(state, tags)) return false;
  if (!matchesProductions(id, state, produces, ctx)) return false;
  if (ctx.selector.ids && !ctx.selector.ids.includes(inst.id)) return false;
  if (ctx.isUpgradable && (!state.upgrade || state.upgrade.length === 0)) return false;
  if (ctx.withTrack && !hasAvailableTrackStep(state, inst.trackProgress)) return false;

  return true;
}

/**
 * Filters cards matching the selector's constraints (scope, tags, produces, ids).
 */
export function cardSelector(
  { scope = [TargetScope.ANY], ...selector }: CardSelector,
  instanceId: number,
  gameState: GameState,
  defs: Record<number, CardDef>,
  stickerDefs: Record<number, Sticker>,
): number[] {
  const { ids } = selector;

  if (ids && scope.length === 1 && scope.includes(TargetScope.ANY)) return ids;
  if (scope.length === 1 && scope.includes(TargetScope.SELF)) return [instanceId];
  if (scope.length === 1 && scope.includes(TargetScope.TRIGGER_SOURCE)) return [instanceId];
  if (scope.length === 1 && scope.includes(TargetScope.LAST_SELECTED)) {
    return selector.lastSelectedIds ?? [];
  }
  if (scope.includes(TargetScope.TOP_OF_DECK)) {
    return gameState.drawPile.slice(0, selector.pickNumber ?? 1);
  }
  if (scope.includes(TargetScope.TOP_OF_DISCARD)) {
    const topDiscard = gameState.discardPile[gameState.discardPile.length - 1];
    return [topDiscard].filter(Boolean);
  }
  if (scope.includes(TargetScope.TOP_OF_DISCOVERY)) {
    return gameState.discoveryPile.slice(0, selector.pickNumber ?? 1);
  }

  const blockedEffect = getAffectedCardsByBoardEffects(gameState, PassiveType.BLOCK);

  if (scope.includes(TargetScope.BLOCKED_BY_THIS)) {
    return blockedEffect[instanceId] ?? [];
  }
  const blockedInstanceIds = Object.values(blockedEffect).flat();

  const locationScopes = scope.filter(s => LOCATION_SCOPES.has(s));
  const hasBlocked = scope.includes(TargetScope.BLOCKED);
  const isFriendly = scope.includes(TargetScope.FRIENDLY);
  const isEnemy = scope.includes(TargetScope.ENEMY);
  const isUpgradable = scope.includes(TargetScope.UPGRADABLE);
  const withTrack = scope.includes(TargetScope.WITH_TRACK);

  const pool = buildCardPool(locationScopes, gameState, blockedInstanceIds);

  const ctx: CardCriteriaContext = {
    instanceId,
    scope,
    blockedInstanceIds,
    gameState,
    defs,
    stickerDefs,
    selector,
    isFriendly,
    isEnemy,
    hasBlocked,
    isUpgradable,
    withTrack,
  };

  const selectedIds = pool
    .filter(id => matchesCardCriteria(id, ctx))
    .filter(id => matchHaving(id, gameState.instances[id].stateId, ctx));

  const countAs2InstanceIds = new Set(
    Object.values(getAffectedCardsByBoardEffects(gameState, PassiveType.COUNT_AS_2)).flat(),
  );

  const extraIds: number[] = [];
  const seen = new Set<number>();
  selectedIds.forEach(id => {
    const countsAs2 = countAs2InstanceIds.has(id) || hasIntrinsicCountAs2(id, gameState, defs);
    if (!seen.has(id) && countsAs2) {
      extraIds.push(id);
      seen.add(id);
    }
  });

  return [...selectedIds, ...extraIds];
}
