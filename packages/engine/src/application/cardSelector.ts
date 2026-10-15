import { CardTag, PassiveType, type ResourceType, TargetScope } from '../domain/enums';
import type {
  CardDef,
  CardInstance,
  CardSelector,
  CardState,
  Condition,
  GameState,
  Resources,
  Sticker,
  ValuePerElement,
} from '../domain/types';
import { mergeResources } from './resources';

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
  if (locationScopes.includes(TargetScope.DISCOVERY)) {
    parts.push(...gameState.discoveryPile, ...(gameState.discoverablePile ?? []));
  }
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
  if (
    ctx.scope?.includes(TargetScope.STAYING) &&
    !cardShouldStayInPlay(id, ctx.gameState, ctx.defs)
  )
    return false;

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
    return gameState.discardPile.slice(-1);
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

export function getRemovedResourcesForState(
  instance: CardInstance,
  stateId: number,
  scope: 'production' | 'actionCost' | 'upgradeCost',
): (keyof Resources)[] {
  return instance.removedResourcesByState?.[stateId]?.[scope] ?? [];
}

export function removeResourceKeys(resources: Resources, keys: (keyof Resources)[]): Resources {
  if (keys.length === 0) return resources;

  const removedCounts = keys.reduce<Record<string, number>>((acc, key) => {
    acc[key] = (acc[key] ?? 0) + 1;
    return acc;
  }, {});

  return Object.entries(resources).reduce<Resources>((acc, [key, value]) => {
    const removed = removedCounts[key] ?? 0;
    const nextValue = Math.max(0, (value ?? 0) - removed);
    if (nextValue > 0) {
      acc[key as keyof Resources] = nextValue;
    }
    return acc;
  }, {});
}

export function getTotalResourceProduction(
  instanceId: number,
  resourceType: ResourceType,
  gameState: GameState,
  defs: Record<number, CardDef>,
  stickerDefs: Record<number, Sticker>,
): number {
  return cardSelector(
    { scope: [TargetScope.ANY], produces: [resourceType] },
    instanceId,
    gameState,
    defs,
    stickerDefs,
  ).reduce((total, id) => {
    const state = getActiveState(gameState.instances[id], defs);
    const prodKeyCount = ((state.productions as Resources[]) || [{}])
      .map(p => {
        return (
          getEffectiveProductions(p, gameState, defs, gameState.instances[id], stickerDefs, false)[
            resourceType
          ] ?? 0
        );
      })
      .reduce((a, b) => Math.max(a, b), -Infinity);
    return total + prodKeyCount;
  }, 0);
}

function isWithinBounds(value: number, min?: number, max?: number): boolean {
  if (min !== undefined && value < min) return false;
  if (max !== undefined && value > max) return false;
  return true;
}

export function evaluateCondition(
  condition: Condition,
  gameState: GameState,
  instanceId: number,
  defs: Record<number, CardDef>,
  stickers: Record<number, Sticker>,
): boolean {
  switch (condition.type) {
    case 'cardCount': {
      const count = cardSelector(condition.cards, instanceId, gameState, defs, stickers).length;
      return isWithinBounds(count, condition.min, condition.max);
    }
    case 'production': {
      const total = getTotalResourceProduction(
        instanceId,
        condition.resourceType,
        gameState,
        defs,
        stickers,
      );
      return isWithinBounds(total, condition.min, condition.max);
    }
    case 'resource': {
      const total = gameState.resources[condition.resourceType] ?? 0;
      return isWithinBounds(total, condition.min, condition.max);
    }
    case 'and':
      return condition.conditions.every(c =>
        evaluateCondition(c, gameState, instanceId, defs, stickers),
      );
    case 'or':
      return condition.conditions.some(c =>
        evaluateCondition(c, gameState, instanceId, defs, stickers),
      );
    case 'not':
      return !evaluateCondition(condition.condition, gameState, instanceId, defs, stickers);
    case 'accumulation':
      return isWithinBounds(
        gameState.instances[instanceId]?.cumulated ?? 0,
        condition.min,
        condition.max,
      );
    case 'justPlayed':
      return gameState.lastDrawnCards.includes(instanceId);
    case 'expansionActive':
      return (
        gameState.activeExpansion === condition.name &&
        !Object.hasOwn(gameState.campaignScores, condition.name)
      );
  }
}

export function getAffectedCardsByBoardEffects(
  gameState: GameState,
  passiveType: PassiveType,
): Record<number, number[]> {
  const affectedInstanceIds: Record<number, number[]> = {};
  Object.entries(gameState.boardEffects).forEach(([sourceId, effects]) =>
    effects
      .filter(be => be.type === passiveType)
      .forEach(be => {
        const ids = be.cards?.ids ?? [Number(sourceId)];
        affectedInstanceIds[Number(sourceId)] = [
          ...(affectedInstanceIds[Number(sourceId)] ?? []),
          ...ids,
        ];
      }),
  );

  return affectedInstanceIds;
}

function calculeBoardEffectsBonus(
  instance: CardInstance,
  gameState: GameState,
  defs: Record<number, CardDef>,
  stickerDefs: Record<number, Sticker>,
): Resources {
  let bonus: Resources = {};
  for (const [instanceSource, passives] of Object.entries(gameState.boardEffects)) {
    passives
      .filter(
        p =>
          p.type === PassiveType.ADJUST_PRODUCTION &&
          cardSelector(
            p.cards ?? { scope: [TargetScope.ANY] },
            Number(instanceSource),
            gameState,
            defs,
            stickerDefs,
          ).includes(instance.id) &&
          p.resources,
      )
      .forEach(passive => {
        if (passive.valuePerElement && passive.resources) {
          const count = countValuePerElement(
            passive.valuePerElement,
            gameState,
            instance.id,
            defs,
            stickerDefs,
          );
          bonus = mergeResources(
            bonus,
            Object.fromEntries(Object.entries(passive.resources).map(([k, v]) => [k, v * count])),
          );
        } else {
          bonus = mergeResources(bonus, passive.resources);
        }
      });
  }
  return bonus;
}

export function getEffectiveProductions(
  base: Resources,
  gameState: GameState,
  defs: Record<number, CardDef>,
  instance: CardInstance,
  stickerDefs: Record<number, Sticker>,
  includeBoardEffects = true,
): Resources {
  const stickerBonus = (instance.stickers[instance.stateId] ?? []).reduce<Resources>(
    (acc, stickerId) => {
      const sticker = stickerDefs[stickerId];
      if (!sticker) return acc;
      if (sticker.production) {
        return {
          ...acc,
          [sticker.production as keyof Resources]:
            (acc[sticker.production as keyof Resources] ?? 0) + 1,
        };
      }
      return acc;
    },
    {},
  );

  const boardEffectsBonus = includeBoardEffects
    ? calculeBoardEffectsBonus(instance, gameState, defs, stickerDefs)
    : {};

  const mergedProduction = mergeResources(mergeResources(base, stickerBonus), boardEffectsBonus);

  const removedKeys = getRemovedResourcesForState(instance, instance.stateId, 'production');
  return removeResourceKeys(mergedProduction, removedKeys);
}

export function getEffectiveGlory(
  activeState: CardState,
  gameState: GameState,
  defs: Record<number, CardDef>,
  instance: CardInstance,
  stickerDefs: Record<number, Sticker> = {},
): number {
  const conditionPasses =
    !activeState.glory?.condition ||
    evaluateCondition(activeState.glory.condition, gameState, instance.id, defs, stickerDefs);

  const baseGlory = activeState.glory && conditionPasses ? activeState.glory.amount : 0;
  const stickerGlory = (instance.stickers[instance.stateId] ?? []).reduce(
    (acc, stickerId) => acc + (stickerDefs[stickerId]?.glory ?? 0),
    0,
  );
  const additionalGlory = instance.glories.reduce((acc, glory) => acc + glory, 0);

  let passiveGlory = 0;

  if (activeState.glory?.valuePerElement && conditionPasses) {
    const count = countValuePerElement(
      activeState.glory.valuePerElement,
      gameState,
      instance.id,
      defs,
      stickerDefs,
    );
    passiveGlory = activeState.glory.valuePerElement.amount * count;
  }

  return baseGlory + stickerGlory + passiveGlory + additionalGlory;
}

/** Retourne l'état actif d'une instance (lève une erreur si la définition ou l'état est introuvable). */
export const getActiveState = (
  instance: CardInstance,
  defs: Record<number, CardDef>,
): CardState => {
  const def = defs[instance.cardId];
  if (!def) throw new Error(`Card def not found: ${instance.cardId}`);
  const state = def.states.find(s => s.id === instance.stateId);
  if (!state) throw new Error(`State ${instance.stateId} not found on card ${instance.cardId}`);
  return state;
};

export function countValuePerElement(
  valuePerElement: ValuePerElement,
  gameState: GameState,
  instanceId: number,
  defs: Record<number, CardDef>,
  stickerDefs: Record<number, Sticker>,
  lastSelectedIds?: number[],
): number {
  let count = 0;
  if (valuePerElement.cards) {
    count = cardSelector(
      { ...valuePerElement.cards, lastSelectedIds },
      instanceId,
      gameState,
      defs,
      stickerDefs,
    ).length;
  } else if (valuePerElement.accumulation && gameState.instances[instanceId].cumulated >= 1) {
    count = gameState.instances[instanceId].cumulated;
  } else if (valuePerElement.ownProduction) {
    count = getTotalProduction(instanceId, gameState, defs, stickerDefs);
  } else if (valuePerElement.productionTotal) {
    const prodKey = valuePerElement.productionTotal;
    count = getTotalResourceProduction(instanceId, prodKey, gameState, defs, stickerDefs);
  }

  if (valuePerElement.deficitTarget !== undefined) {
    return Math.max(0, valuePerElement.deficitTarget - count);
  }
  return count;
}

interface StateCriteriaContext {
  gameState: GameState;
  defs: Record<number, CardDef>;
  stickerDefs: Record<number, Sticker>;
  selector: Pick<CardSelector, 'having'>;
}

function matchHavingGlory(id: number, stateId: number, ctx: StateCriteriaContext): boolean {
  const { gameState, defs, stickerDefs, selector } = ctx;
  const instance = gameState.instances[id];
  if (!instance) return false;
  const activeState = defs[instance.cardId]?.states.find(s => s.id === stateId);
  if (
    activeState &&
    (selector.having?.minGlory !== undefined || selector.having?.maxGlory !== undefined)
  ) {
    const baseGlory = getEffectiveGlory(activeState, gameState, defs, instance, stickerDefs);
    if (selector.having.minGlory !== undefined && baseGlory < selector.having.minGlory)
      return false;
    if (selector.having.maxGlory !== undefined && baseGlory > selector.having.maxGlory)
      return false;
  }
  return true;
}

function matchHavingProduction(id: number, stateId: number, ctx: StateCriteriaContext): boolean {
  const { gameState, defs, stickerDefs, selector } = ctx;
  const instance = gameState.instances[id];
  if (!instance) return false;
  const activeState = defs[instance.cardId]?.states.find(s => s.id === stateId);
  if (
    activeState &&
    (selector.having?.minProduction !== undefined || selector.having?.maxProduction !== undefined)
  ) {
    const baseProduction = (activeState.productions ?? []).reduce((maxProduction, production) => {
      const effectiveProduction = getEffectiveProductions(
        production,
        gameState,
        defs,
        instance,
        stickerDefs,
        false,
      );
      const totalProduction = Object.values(effectiveProduction).reduce(
        (sum, amount) => sum + amount,
        0,
      );
      return Math.max(maxProduction, totalProduction);
    }, 0);
    if (
      selector.having.minProduction !== undefined &&
      baseProduction < selector.having.minProduction
    )
      return false;
    if (
      selector.having.maxProduction !== undefined &&
      baseProduction > selector.having.maxProduction
    )
      return false;
  }
  return true;
}

function matchHavingSticker(id: number, stateId: number, ctx: StateCriteriaContext): boolean {
  const { gameState, selector } = ctx;
  const instance = gameState.instances[id];
  if (!instance) return false;
  if (selector.having?.minStickers !== undefined || selector.having?.maxStickers !== undefined) {
    const stickers = instance.stickers[stateId] ?? [];
    if (selector.having.minStickers !== undefined && stickers.length < selector.having.minStickers)
      return false;
    if (selector.having.maxStickers !== undefined && stickers.length > selector.having.maxStickers)
      return false;
  }
  return true;
}

export function matchHaving(id: number, stateId: number, ctx: StateCriteriaContext): boolean {
  if (!ctx.selector.having) return true;

  return (
    matchHavingGlory(id, stateId, ctx) &&
    matchHavingProduction(id, stateId, ctx) &&
    matchHavingSticker(id, stateId, ctx)
  );
}

export function getTotalProduction(
  instanceId: number,
  gameState: GameState,
  defs: Record<number, CardDef>,
  stickerDefs: Record<number, Sticker>,
): number {
  const instance = gameState.instances[instanceId];
  if (!instance) return 0;
  const state = getActiveState(instance, defs);
  const productions = (state.productions as Resources[]) ?? [{}];
  return productions.reduce((maxTotal, base) => {
    const effective = getEffectiveProductions(base, gameState, defs, instance, stickerDefs, false);
    const total = Object.values(effective).reduce<number>((sum, v) => sum + (v ?? 0), 0);
    return Math.max(maxTotal, total);
  }, 0);
}

// Sticker ID for the 'stays_in_play' effect (see src/data/stickers.ts)
const STAYS_IN_PLAY_STICKER_ID = 7;

export function cardShouldStayInPlay(
  instanceId: number,
  gameState: GameState,
  cardDefs: Record<number, CardDef>,
): boolean {
  const instance = gameState.instances[instanceId];
  if (!instance) return false;
  const def = cardDefs[instance.cardId];
  if (isPermanent(getActiveState(instance, cardDefs))) return true;
  const state = def?.states.find(s => s.id === instance.stateId);
  if (state?.passives?.some(p => p.type === PassiveType.STAY_IN_PLAY)) return true;

  const stayInPlayTargets = new Set<number>(
    Object.entries(gameState.boardEffects).flatMap(([sourceId, passives]) =>
      passives
        .filter(passive => passive.type === PassiveType.STAY_IN_PLAY)
        .flatMap(passive => {
          if (!passive.cards) {
            return [Number(sourceId)];
          }
          return cardSelector(passive.cards, Number(sourceId), gameState, cardDefs, {});
        }),
    ),
  );

  if (stayInPlayTargets.has(instanceId)) return true;

  if (
    Object.values(getAffectedCardsByBoardEffects(gameState, PassiveType.STAY_IN_PLAY))
      .flat()
      .includes(instanceId)
  )
    return true;
  // If the card is blocked by a card that also has STAY_IN_PLAY, it should stay in play
  const blockerCard = Object.entries(
    getAffectedCardsByBoardEffects(gameState, PassiveType.BLOCK),
  ).find(([_, ids]) => ids.includes(instanceId))?.[0];
  if (blockerCard && stayInPlayTargets.has(Number(blockerCard))) {
    return true;
  }
  if (
    blockerCard &&
    Object.values(getAffectedCardsByBoardEffects(gameState, PassiveType.STAY_IN_PLAY))
      .flat()
      .includes(Number(blockerCard))
  ) {
    return true;
  }
  const stickers = instance.stickers[instance.stateId] ?? [];
  return stickers.includes(STAYS_IN_PLAY_STICKER_ID);
}

/** A permanent card state: kept out of the deck, always active (`CardTag.PERMANENT`). */
export function isPermanent(state: CardState | undefined): boolean {
  return state?.tags?.includes(CardTag.PERMANENT) ?? false;
}
