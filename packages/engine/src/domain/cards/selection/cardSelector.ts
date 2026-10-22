import { type CardTag, PassiveType, TargetScope } from '../../enums';
import type { CardDef, CardSelector, CardState, GameState, Sticker } from '../../types';
import { cardShouldStayInPlay } from './cardShouldStayInPlay';
import { countValuePerElement } from './countValuePerElement';
import { getAffectedCardsByBoardEffects } from './getAffectedCardsByBoardEffects';
import { getEffectiveProductions } from './getEffectiveProductions';
import { matchHaving } from './matchHaving';

const LOCATION_SCOPES = new Set([
  TargetScope.DECK,
  TargetScope.DRAWN,
  TargetScope.DISCARDED,
  TargetScope.DISCARDED_FROM_PLAY,
  TargetScope.BOARD,
  TargetScope.DISCOVERY,
  TargetScope.DISCARD,
  TargetScope.BLOCKED,
  TargetScope.PERMANENTS,
  TargetScope.PURGE_SELECTED,
  TargetScope.BOX,
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
  if (locationScopes.includes(TargetScope.DISCARDED_FROM_PLAY)) {
    // Still in play while the discard fires its triggers, or blocked by a card in play
    // (Quarantine): blocked cards stay on the board.
    parts.push(
      ...gameState.lastDiscardedCards.filter(
        id => gameState.board.includes(id) || gameState.permanents.includes(id),
      ),
    );
  }
  if (locationScopes.includes(TargetScope.BOARD)) parts.push(...gameState.board);
  if (locationScopes.includes(TargetScope.DISCOVERY)) {
    parts.push(...gameState.discoveryPile, ...(gameState.discoverablePile ?? []));
  }
  if (locationScopes.includes(TargetScope.DISCARD)) parts.push(...gameState.discardPile);
  if (locationScopes.includes(TargetScope.BOX)) {
    parts.push(...(gameState.discoverablePile ?? gameState.discoveryPile));
  }
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
  // Only called with selected ids, which are instances.
  const inst = gameState.instances[id];
  const state = defs[inst.cardId]?.states.find(s => s.id === inst.stateId);
  if (!state?.passives?.length) return false;

  return state.passives.some(passive => passive.type === PassiveType.COUNT_AS_2);
}

/**
 * Copies a card adds to a selection besides itself: "counts as N" (COUNT_AS, `amount` = N), or
 * one per element of `valuePerElement` (Inventor Workshop: 1 invention per box), only for the
 * selections asking for the passive's `cards.tags` when it has some.
 */
function intrinsicCountAsExtra(id: number, ctx: CardCriteriaContext): number {
  const { gameState, defs, stickerDefs } = ctx;
  const inst = gameState.instances[id];
  const state = inst && defs[inst.cardId]?.states.find(s => s.id === inst.stateId);
  const countAs = state?.passives?.find(passive => passive.type === PassiveType.COUNT_AS);
  if (!countAs) return 0;
  const onlyFor = countAs.cards?.tags;
  if (onlyFor && !onlyFor.some(tag => ctx.selector.tags?.includes(tag))) return 0;
  if (countAs.valuePerElement) {
    return countValuePerElement(countAs.valuePerElement, gameState, id, defs, stickerDefs);
  }
  return Math.max(0, (countAs.amount ?? 1) - 1);
}

function matchesStickers(
  stickers: number[],
  { stickerIds, withoutStickerIds }: CardSelector,
): boolean {
  if (stickerIds && !stickerIds.some(id => stickers.includes(id))) return false;
  if (withoutStickerIds?.some(id => stickers.includes(id))) return false;
  return true;
}

function passesScopeConstraints(id: number, ctx: CardCriteriaContext): boolean {
  if (!ctx.scope?.includes(TargetScope.SELF) && id === ctx.instanceId) return false;
  if (!ctx.hasBlocked && ctx.blockedInstanceIds.includes(id)) return false;
  return true;
}

/** UPGRADABLE: the card has an upgrade; `fullyUpgraded`: it has none left. */
function matchesUpgrades(state: CardState, ctx: CardCriteriaContext): boolean {
  const upgradable = (state.upgrade?.length ?? 0) > 0;
  if (ctx.isUpgradable && !upgradable) return false;
  return !(ctx.selector.fullyUpgraded && upgradable);
}

/** A sticker gives the card one of `tags` (Knight sticker 11), or is one of `orStickerIds`. */
function isTaggedBySticker(
  stickers: number[],
  tags: CardTag[] | undefined,
  ctx: CardCriteriaContext,
): boolean {
  if (ctx.selector.orStickerIds?.some(s => stickers.includes(s))) return true;
  const stickerTags = stickers.flatMap(stickerId => ctx.stickerDefs[stickerId]?.tags ?? []);
  return !!tags?.some(tag => stickerTags.includes(tag));
}

/** The name is already written on the card owning the selector (Famous Court). */
function isWrittenOn(ctx: CardCriteriaContext, name: string): boolean {
  return !!ctx.gameState.instances[ctx.instanceId]?.writtenNames?.includes(name);
}

function matchesCardCriteria(id: number, ctx: CardCriteriaContext): boolean {
  if (!passesScopeConstraints(id, ctx)) return false;

  const inst = ctx.gameState.instances[id];
  if (!inst || !ctx.defs) return false;

  const state = ctx.defs[inst.cardId]?.states.find(s => s.id === inst.stateId);
  if (!state) return false;

  const { tags, produces, name } = ctx.selector;

  if (!matchesAlignmentAndName(state, ctx.isFriendly, ctx.isEnemy, name)) return false;
  const stickers = inst.stickers[inst.stateId] ?? [];
  if (!matchesTags(state, tags) && !isTaggedBySticker(stickers, tags, ctx)) return false;
  if (!matchesProductions(id, state, produces, ctx)) return false;
  if (ctx.selector.ids && !ctx.selector.ids.includes(inst.id)) return false;
  if (!matchesStickers(stickers, ctx.selector)) return false;
  if (!matchesUpgrades(state, ctx)) return false;
  if (ctx.withTrack && !hasAvailableTrackStep(state, inst.trackProgress)) return false;
  return (
    matchesNotWritten(state.name, ctx) &&
    matchesEquipment(id, ctx) &&
    matchesStaying(id, ctx) &&
    matchesPlace(id, state, ctx)
  );
}

/** `withoutTags`, and `inPlayWhenInPlay` (Inventor Workshop: the inventions in play with it). */
function matchesPlace(id: number, state: CardState, ctx: CardCriteriaContext): boolean {
  if (ctx.selector.withoutTags?.some(tag => state.tags?.includes(tag))) return false;
  if (!ctx.selector.inPlayWhenInPlay) return true;
  const { board, permanents } = ctx.gameState;
  const inPlay = (cardId: number) => board.includes(cardId) || permanents.includes(cardId);
  return !inPlay(ctx.instanceId) || inPlay(id);
}

function matchesNotWritten(name: string, ctx: CardCriteriaContext): boolean {
  return !ctx.selector.notWrittenHere || !isWrittenOn(ctx, name);
}

/** An equipped card is no longer a card of its own: only `equipped` (or itself) selects it. */
function matchesEquipment(id: number, ctx: CardCriteriaContext): boolean {
  const isEquipped = ctx.gameState.equipped?.[id] !== undefined;
  if (ctx.selector.equipped !== undefined) return isEquipped === ctx.selector.equipped;
  return !isEquipped || id === ctx.instanceId;
}

/** STAYING keeps the cards that stay in play, `notStaying` the others. */
function matchesStaying(id: number, ctx: CardCriteriaContext): boolean {
  const wantsStaying = ctx.scope?.includes(TargetScope.STAYING);
  if (!wantsStaying && !ctx.selector.notStaying) return true;
  const staying = cardShouldStayInPlay(id, ctx.gameState, ctx.defs);
  return wantsStaying ? staying : !staying;
}

/** The top cards of the deck; "(if friendly)" keeps the friendly ones (Enemy Archer). */
function topOfDeck(
  scope: TargetScope[],
  pickNumber: number | undefined,
  gameState: GameState,
  defs: Record<number, CardDef>,
): number[] {
  const top = gameState.drawPile.slice(0, pickNumber ?? 1);
  if (!scope.includes(TargetScope.FRIENDLY) && !scope.includes(TargetScope.ENEMY)) return top;
  return top.filter(id => {
    const inst = gameState.instances[id];
    const negative = inst && defs[inst.cardId]?.states.find(s => s.id === inst.stateId)?.negative;
    return scope.includes(TargetScope.FRIENDLY) ? !negative : !!negative;
  });
}

/** The card `instanceId` is equipped to. */
function holderOf(instanceId: number, gameState: GameState): number[] {
  const holder = gameState.equipped?.[instanceId];
  return holder === undefined ? [] : [holder];
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
    return topOfDeck(scope, selector.pickNumber, gameState, defs);
  }
  if (scope.includes(TargetScope.TOP_OF_DISCARD)) {
    return gameState.discardPile.slice(-1);
  }

  const blockedEffect = getAffectedCardsByBoardEffects(gameState, PassiveType.BLOCK);

  if (scope.includes(TargetScope.BLOCKED_BY_THIS)) {
    return blockedEffect[instanceId] ?? [];
  }
  if (scope.includes(TargetScope.HOLDER)) return holderOf(instanceId, gameState);
  const blockedInstanceIds = Object.values(blockedEffect).flat();

  const locationScopes = scope.filter(s => LOCATION_SCOPES.has(s));
  const hasBlocked =
    scope.includes(TargetScope.BLOCKED) || scope.includes(TargetScope.DISCARDED_FROM_PLAY);
  const isFriendly = scope.includes(TargetScope.FRIENDLY);
  const isEnemy = scope.includes(TargetScope.ENEMY);
  const isUpgradable = scope.includes(TargetScope.UPGRADABLE);
  const withTrack = scope.includes(TargetScope.WITH_TRACK);

  const pool =
    selector.topOfDeck === undefined
      ? buildCardPool(locationScopes, gameState, blockedInstanceIds)
      : gameState.drawPile.slice(0, selector.topOfDeck);

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

  const matching = pool
    .filter(id => matchesCardCriteria(id, ctx))
    .filter(id => matchHaving(id, gameState.instances[id].stateId, ctx));
  const selectedIds = selector.firstOnly ? matching.slice(0, 1) : matching;

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
    if (!seen.has(id)) {
      extraIds.push(...Array.from({ length: intrinsicCountAsExtra(id, ctx) }, () => id));
      seen.add(id);
    }
  });

  return [...selectedIds, ...extraIds];
}
