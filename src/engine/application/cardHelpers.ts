import { cardSelector } from '@engine/application/cardSelector';
import { countValuePerElement } from '@engine/application/effectResolver';
import { mergeResources } from '@engine/application/gameStateHelper';
import {
  ActionEffectType,
  PassiveType,
  type ResourceType,
  TargetScope,
  type Trigger,
} from '@engine/domain/enums';
import type {
  ActionEffect,
  CardAction,
  CardDef,
  CardInstance,
  CardState,
  Condition,
  Cost,
  GameState,
  Resources,
  StepDef,
  Sticker,
  TriggerEntry,
} from '@engine/domain/types';

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
          getEffectiveProductions(p, state, gameState, defs, gameState.instances[id], stickerDefs, {
            includeBoardEffects: false,
            includePassives: false,
          })[resourceType] ?? 0
        );
      })
      .reduce((a, b) => Math.max(a, b), -Infinity);
    return total + prodKeyCount;
  }, 0);
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
      if (condition.min !== undefined && count < condition.min) return false;
      if (condition.max !== undefined && count > condition.max) return false;
      return true;
    }
    case 'production': {
      const total = getTotalResourceProduction(
        instanceId,
        condition.resourceType,
        gameState,
        defs,
        stickers,
      );
      if (condition.min !== undefined && total < condition.min) return false;
      if (condition.max !== undefined && total > condition.max) return false;
      return true;
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
    for (const passive of passives
      .flat()
      .filter(p => p.type === PassiveType.ADJUST_PRODUCTION && p.resources)) {
      if (
        cardSelector(
          passive.cards ?? { scope: [TargetScope.BOARD] },
          Number(instanceSource),
          gameState,
          defs,
          stickerDefs,
        ).includes(instance.id) &&
        passive.resources
      ) {
        bonus = mergeResources(bonus, passive.resources);
      }
    }
  }
  return bonus;
}

function calculePassiveProductionBonus(
  activeState: CardState,
  instance: CardInstance,
  gameState: GameState,
  defs: Record<number, CardDef>,
  stickerDefs: Record<number, Sticker>,
): Resources {
  let passiveBonus: Resources = {};
  for (const passive of activeState.passives ?? []) {
    if (passive.type === PassiveType.ADJUST_PRODUCTION && passive.valuePerElement?.resource) {
      const { amount, resource, cards: sel, accumulation } = passive.valuePerElement;
      let count = 0;
      if (sel) {
        count = cardSelector(sel, instance.id, gameState, defs, stickerDefs).length;
      } else if (accumulation) {
        count = instance.cumulated ?? 0;
      }

      if (count > 0) {
        passiveBonus = mergeResources(passiveBonus, { [resource[0]]: amount * count });
      }
    }
  }
  return passiveBonus;
}

export function getEffectiveProductions(
  base: Resources,
  activeState: CardState,
  gameState: GameState,
  defs: Record<number, CardDef>,
  instance: CardInstance,
  stickerDefs: Record<number, Sticker>,
  {
    includeBoardEffects = true,
    includePassives = true,
  }: { includeBoardEffects?: boolean; includePassives?: boolean } = {},
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

  const passiveBonus = includePassives
    ? calculePassiveProductionBonus(activeState, instance, gameState, defs, stickerDefs)
    : {};

  const boardEffectsBonus = includeBoardEffects
    ? calculeBoardEffectsBonus(instance, gameState, defs, stickerDefs)
    : {};

  return mergeResources(
    mergeResources(base, stickerBonus),
    mergeResources(passiveBonus, boardEffectsBonus),
  );
}

export function getEffectiveGlory(
  activeState: CardState,
  gameState: GameState,
  defs: Record<number, CardDef>,
  instance: CardInstance,
  stickerDefs: Record<number, Sticker> = {},
): number {
  if (!activeState.glory) return 0;
  if (
    activeState.glory.condition &&
    !evaluateCondition(activeState.glory.condition, gameState, instance.id, defs, stickerDefs)
  ) {
    return 0;
  }

  const baseGlory = activeState.glory.amount ?? 0;
  const stickerGlory = (instance.stickers[instance.stateId] ?? []).reduce(
    (acc, stickerId) => acc + (stickerDefs[stickerId]?.glory ?? 0),
    0,
  );

  let passiveGlory = 0;

  if (activeState.glory.valuePerElement) {
    const count = countValuePerElement(
      activeState.glory.valuePerElement,
      gameState,
      instance.id,
      defs,
      stickerDefs,
    );
    passiveGlory = (activeState.glory.valuePerElement.amount ?? 0) * count;
  }

  return baseGlory + stickerGlory + passiveGlory;
}

export function tagClass(tag: string, isEnemy: boolean): string {
  const t = tag.toLowerCase();
  const tagClass = 'border';
  if (isEnemy) return tagClass + ' bg-tag-enemy/10 border-tag-enemy';
  if (t === 'building') return tagClass + ' bg-tag-building/10 border-tag-building';
  if (t === 'person') return tagClass + ' bg-tag-person/10 border-tag-person';
  if (t === 'seafaring') return tagClass + ' bg-tag-seafaring/10 border-tag-seafaring';
  if (t === 'land') return tagClass + ' bg-tag-land/10 border-tag-land';
  if (t === 'livestock') return tagClass + ' bg-tag-livestock/10 border-tag-livestock';
  return tagClass + ' bg-tag-tag/10 border-tag-tag';
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

/** Vérifie si les ressources disponibles suffisent pour payer un coût. */
export function canAffordResources(available: Resources, cost?: Cost): boolean {
  if (!cost?.resources) return true;
  if (!cost.resources?.[0]) return true;
  return Object.entries(cost.resources[0]).every(
    ([k, v]) => (available[k as keyof Resources] ?? 0) >= v,
  );
}

/** Vérifie si les cartes requises pour un coût discard/destroy existent dans la sélection. */
export function canAffordCardCost(
  cost: Cost | undefined,
  instanceId: number,
  gameState: GameState,
  defs: Record<number, CardDef>,
  stickerDefs: Record<number, Sticker>,
): boolean {
  if (
    cost?.discard?.length &&
    cost.discard.some(discardCost => {
      const candidates = cardSelector(discardCost, instanceId, gameState, defs, stickerDefs).filter(
        id => gameState.board.includes(id),
      );
      return candidates.length < (discardCost.number ?? 1);
    })
  ) {
    return false;
  }

  if (cost?.destroy) {
    const available = cardSelector(cost.destroy, instanceId, gameState, defs, stickerDefs);
    if (available.length < (cost.destroy.number ?? 1)) return false;
  }
  return true;
}

function getBoardEffectTriggersAction(
  gameState: GameState,
  defs: Record<number, CardDef>,
  stickerDefs: Record<number, Sticker>,
  trigger: Trigger,
): TriggerEntry[] {
  return Object.entries(gameState.boardEffects).flatMap(([sourceId, passives]) => {
    const cardActions: CardAction[] = [];
    let instanceId = Number(sourceId);
    passives
      .filter(be => be.type === PassiveType.ADD_TRIGGER && be.trigger?.type === trigger)
      .forEach(be => {
        if (be.trigger?.cards) {
          const selectedCards = cardSelector(
            be.trigger.cards,
            instanceId,
            gameState,
            defs,
            stickerDefs,
          );

          if (selectedCards.length === 0) return;

          instanceId = selectedCards[0];
        }
        if (be.trigger?.actions) {
          cardActions.push({
            id: `board_effect_${sourceId}`,
            actionEffects: be.trigger.actions.map(ae => ({
              ...ae,
              cards: ae.cards?.scope?.includes(TargetScope.SELF) ? { ids: [instanceId] } : ae.cards,
            })),
          });
        }
      });

    return cardActions.map(effectDef => ({ effectDef, sourceInstanceId: Number(sourceId) }));
  });
}

export function getInstancesTriggerEffects(
  instances: CardInstance[],
  defs: Record<number, CardDef>,
  stickerDefs: Record<number, Sticker>,
  effect: Trigger,
  gameState: GameState,
): TriggerEntry[] {
  const effects = instances.reduce<TriggerEntry[]>((acc, instance) => {
    const state = getActiveState(instance, defs);
    const effects = state.actions?.filter(ce => ce.trigger === effect) ?? [];

    return [...acc, ...effects.map(effectDef => ({ effectDef, sourceInstanceId: instance.id }))];
  }, [] as TriggerEntry[]);

  effects.push(...getBoardEffectTriggersAction(gameState, defs, stickerDefs, effect));

  return effects;
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
  if (getActiveState(instance, cardDefs)?.permanent) return true;
  const state = def?.states.find(s => s.id === instance.stateId);
  if (state?.passives?.some(p => p.type === PassiveType.STAY_IN_PLAY)) return true;
  if (
    Object.values(getAffectedCardsByBoardEffects(gameState, PassiveType.STAY_IN_PLAY))
      .flat()
      .includes(instanceId)
  )
    return true;
  const stickers = instance.stickers[instance.stateId] ?? [];
  return stickers.includes(STAYS_IN_PLAY_STICKER_ID);
}

export function cardIsBlocked(instanceId: number, gameState: GameState): boolean {
  return Object.values(getAffectedCardsByBoardEffects(gameState, PassiveType.BLOCK))
    .flat()
    .includes(instanceId);
}

export function getFirstAvailableTrackStep(
  actionEffects: ActionEffect[],
  instanceId: number,
  gameState: GameState,
  defs: Record<number, CardDef>,
  stickerDefs: Record<number, Sticker>,
): StepDef | undefined {
  const trackEffect = actionEffects.find(e => e.type === ActionEffectType.TRACK_ADVANCE);
  if (!trackEffect?.cards) return undefined;

  const targetIds = cardSelector(trackEffect.cards, instanceId, gameState, defs, stickerDefs);

  for (const targetId of targetIds) {
    const instance = gameState.instances[targetId];
    if (!instance) continue;
    const def = defs[instance.cardId];
    const state = def?.states.find(s => s.id === instance.stateId);
    const track = state?.track;
    if (!track) continue;
    const step = track.steps.find(s => !instance.trackProgress.includes(s.id));
    if (step) return step;
  }

  return undefined;
}
