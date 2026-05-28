import { cardSelector } from '@engine/application/cardSelector';
import { countValuePerElement } from '@engine/application/effectResolver';
import { mergeResources } from '@engine/application/gameStateHelper';
import {
  getPayableResourceCostVariants,
  getSourceResourceEquivalence,
} from '@engine/application/resourceEquivalence';
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

function sanitizeResources(resources: Resources): Resources {
  return Object.entries(resources).reduce<Resources>((acc, [key, value]) => {
    const clampedValue = Math.max(0, Number(value) || 0);
    if (clampedValue > 0) {
      acc[key as keyof Resources] = clampedValue;
    }
    return acc;
  }, {});
}

function getRemovedResourcesForState(
  instance: CardInstance,
  stateId: number,
  scope: 'production' | 'actionCost' | 'upgradeCost',
): (keyof Resources)[] {
  return instance.removedResourcesByState?.[stateId]?.[scope] ?? [];
}

function removeResourceKeys(resources: Resources, keys: (keyof Resources)[]): Resources {
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

function removeResourceKeysFromCost(cost: Cost, keys: (keyof Resources)[]): Cost {
  if (keys.length === 0 || !cost.resources?.length) return cost;
  return {
    ...cost,
    resources: cost.resources.map(resourceCost => removeResourceKeys(resourceCost, keys)),
  };
}

export function getEffectiveUpgradeCost(
  baseCost: Cost,
  gameState: GameState,
  defs: Record<number, CardDef>,
  stickerDefs: Record<number, Sticker>,
  instanceId: number,
): Cost {
  const adjustedCost = JSON.parse(JSON.stringify(baseCost)) as Cost;
  const sourceInstance = gameState.instances[instanceId];

  for (const [passiveSourceId, passives] of Object.entries(gameState.boardEffects)) {
    for (const passive of passives.filter(
      p => p.type === PassiveType.ADJUST_UPDATE_COST && p.resources,
    )) {
      const affectedInstanceIds = cardSelector(
        passive.cards ?? { scope: [TargetScope.ANY] },
        Number(passiveSourceId),
        gameState,
        defs,
        stickerDefs,
      );

      if (!affectedInstanceIds.includes(instanceId) || !passive.resources) {
        continue;
      }

      const resourceCosts = adjustedCost.resources?.length ? adjustedCost.resources : [{}];
      adjustedCost.resources = resourceCosts.map(cost =>
        sanitizeResources(mergeResources(cost, passive.resources as Resources)),
      );
    }
  }

  if (!sourceInstance) return adjustedCost;
  const removedKeys = getRemovedResourcesForState(
    sourceInstance,
    sourceInstance.stateId,
    'upgradeCost',
  );

  return removeResourceKeysFromCost(adjustedCost, removedKeys);
}

export function getEffectiveActionCost(baseCost: Cost | undefined, instance: CardInstance): Cost {
  if (!baseCost) return {};
  const removedKeys = getRemovedResourcesForState(instance, instance.stateId, 'actionCost');
  return removeResourceKeysFromCost(baseCost, removedKeys);
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

function applyReplacementOnProduction(
  production: Resources,
  fromResource: keyof Resources,
  toResource: keyof Resources,
): Resources {
  if (fromResource === toResource) return production;
  const amountToMove = production[fromResource] ?? 0;
  if (amountToMove <= 0) return production;

  return sanitizeResources({
    ...production,
    [fromResource]: 0,
    [toResource]: (production[toResource] ?? 0) + amountToMove,
  });
}

function getApplicableReplaceResourceProductionPassives(
  instance: CardInstance,
  gameState: GameState,
  defs: Record<number, CardDef>,
  stickerDefs: Record<number, Sticker>,
): Array<{ from: keyof Resources; to: keyof Resources }> {
  const statePassives = getActiveState(instance, defs).passives ?? [];
  const boardEffectPassives = Object.entries(gameState.boardEffects).flatMap(
    ([sourceId, passives]) =>
      passives.filter(passive => {
        if (passive.type !== PassiveType.REPLACE_RESOURCE_PRODUCTION) return false;
        const selectedIds = cardSelector(
          passive.cards ?? { scope: [TargetScope.ANY] },
          Number(sourceId),
          gameState,
          defs,
          stickerDefs,
        );
        return selectedIds.includes(instance.id);
      }),
  );

  return [...statePassives, ...boardEffectPassives]
    .filter(passive => passive.type === PassiveType.REPLACE_RESOURCE_PRODUCTION)
    .flatMap(passive => {
      const resources = passive.resources;
      if (!resources) return [];

      const orderedResources = Object.entries(resources)
        .filter(([, value]) => (value ?? 0) > 0)
        .map(([key]) => key as keyof Resources);

      if (orderedResources.length < 2) return [];

      return [{ from: orderedResources[0], to: orderedResources[1] }];
    });
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

export function getProductionChoicesForAction(
  base: Resources,
  gameState: GameState,
  defs: Record<number, CardDef>,
  instance: CardInstance,
  stickerDefs: Record<number, Sticker>,
): Resources[] {
  const baseProduction = getEffectiveProductions(base, gameState, defs, instance, stickerDefs);
  const replacements = getApplicableReplaceResourceProductionPassives(
    instance,
    gameState,
    defs,
    stickerDefs,
  );

  const unique = new Map<string, Resources>();
  const serialize = (resources: Resources): string =>
    JSON.stringify(
      Object.keys(resources)
        .sort((a, b) => a.localeCompare(b))
        .reduce<Record<string, number>>((acc, key) => {
          const value = resources[key as keyof Resources];
          if ((value ?? 0) > 0) acc[key] = value as number;
          return acc;
        }, {}),
    );

  let choices: Resources[] = [baseProduction];
  replacements.forEach(({ from, to }) => {
    choices = choices.flatMap(choice => [choice, applyReplacementOnProduction(choice, from, to)]);
  });

  choices.forEach(choice => {
    unique.set(serialize(choice), choice);
  });

  return [...unique.values()];
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
export function canAffordResources(available: Resources, resources: Resources[]): boolean {
  return (
    resources.length === 0 ||
    resources.some(r =>
      Object.entries(r).every(([k, v]) => (available[k as keyof Resources] ?? 0) >= v),
    )
  );
}

/** Vérifie si les cartes requises pour un coût discard/destroy existent dans la sélection. */
export function canAffordCost(
  cost: Cost | undefined,
  instanceId: number,
  gameState: GameState,
  defs: Record<number, CardDef>,
  stickerDefs: Record<number, Sticker>,
  equivalenceSourceInstanceId = instanceId,
): boolean {
  if (cost?.resources) {
    const equivalence = getSourceResourceEquivalence(
      equivalenceSourceInstanceId,
      gameState,
      defs,
      stickerDefs,
    );

    const canAffordResourceCostOption = equivalence
      ? cost.resources.some(
          resourceCost =>
            getPayableResourceCostVariants(resourceCost, gameState.resources, equivalence).length >
            0,
        )
      : canAffordResources(gameState.resources, cost.resources);

    if (!canAffordResourceCostOption) return false;
  }

  if (cost?.accumulated && (gameState.instances[instanceId]?.cumulated ?? 0) < cost.accumulated) {
    return false;
  }

  if (
    cost?.discard?.length &&
    cost.discard.some(discardCost => {
      const candidates = cardSelector(discardCost, instanceId, gameState, defs, stickerDefs).filter(
        id => gameState.board.includes(id),
      );
      return candidates.length < (discardCost.pickNumber ?? 1);
    })
  ) {
    return false;
  }

  if (cost?.destroy) {
    const available = cardSelector(cost.destroy, instanceId, gameState, defs, stickerDefs);
    if (available.length < (cost.destroy.pickNumber ?? 1)) return false;
  }
  return true;
}

export function canAffordTrackAdvanceCost(
  action: CardAction,
  instance: CardInstance,
  gameState: GameState,
  defs: Record<number, CardDef>,
  stickerDefs: Record<number, Sticker>,
): boolean {
  const cs = getActiveState(instance, defs);
  const payableTrackEffects = action.actionEffects.filter(
    e => e.type === ActionEffectType.TRACK_ADVANCE && e.payingCost !== false,
  );
  const hasTrackAdvance = payableTrackEffects.length > 0 && cs?.track;

  if (!hasTrackAdvance) return true;

  return payableTrackEffects.every(trackEffect => {
    if (defs[instance.cardId].states.find(s => s.id === instance.stateId)?.track?.inOrder) {
      const firstTrackStep = getFirstAvailableTrackStep(
        [trackEffect],
        instance.id,
        gameState,
        defs,
        stickerDefs,
      );

      return (
        !!firstTrackStep &&
        canAffordCost(firstTrackStep.cost, instance.id, gameState, defs, stickerDefs)
      );
    }

    const trackSteps = cs.track?.steps ?? [];
    return trackSteps.some(step => {
      if (instance.trackProgress.includes(step.id)) return false;
      return canAffordCost(step.cost, instance.id, gameState, defs, stickerDefs);
    });
  });
}

function getBoardEffectTriggersAction(
  gameState: GameState,
  defs: Record<number, CardDef>,
  stickerDefs: Record<number, Sticker>,
  trigger: Trigger,
): TriggerEntry[] {
  return Object.entries(gameState.boardEffects).flatMap(([sourceId, passives]) => {
    const cardActions: CardAction[] = [];
    const originalSourceId = Number(sourceId);
    let instanceId = originalSourceId;
    passives
      .filter(
        passive =>
          passive.type === PassiveType.ADD_TRIGGER &&
          passive.trigger?.type === trigger &&
          (!passive.condition ||
            evaluateCondition(passive.condition, gameState, originalSourceId, defs, stickerDefs)),
      )
      .forEach(passive => {
        if (passive.trigger?.cards) {
          const selectedCards = cardSelector(
            passive.trigger.cards,
            instanceId,
            gameState,
            defs,
            stickerDefs,
          );

          if (selectedCards.length === 0) return;

          instanceId = selectedCards[0];
        }
        if (passive.trigger?.actions) {
          const getCard = (ae: ActionEffect) => {
            if (ae.cards?.scope?.includes(TargetScope.TRIGGER_SOURCE))
              return { ids: [originalSourceId] };
            return ae.cards?.scope?.includes(TargetScope.SELF) ? { ids: [instanceId] } : ae.cards;
          };
          cardActions.push({
            id: passive.trigger.id,
            optional: passive.trigger?.optional,
            actionEffects: passive.trigger.actions.map(ae => ({
              ...ae,
              cards: getCard(ae),
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
    const effects =
      state.actions?.filter(ce => {
        return (
          ce.trigger === effect &&
          canAffordCost(ce.cost, instance.id, gameState, defs, stickerDefs) &&
          canAffordTrackAdvanceCost(ce, instance, gameState, defs, stickerDefs) &&
          !instance.usedActionIds?.includes(ce.id)
        );
      }) ?? [];

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
  // If the card is blocked by a card that also has STAY_IN_PLAY, it should stay in play
  const blockerCard = Object.entries(
    getAffectedCardsByBoardEffects(gameState, PassiveType.BLOCK),
  ).find(([_, ids]) => ids.includes(instanceId))?.[0];
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
