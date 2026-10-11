import { ActionEffectType, PassiveType, TargetScope, type Trigger } from '../domain/enums';
import type {
  ActionEffect,
  CardAction,
  CardDef,
  CardInstance,
  Cost,
  GameState,
  Resources,
  StepDef,
  Sticker,
  TriggerEntry,
} from '../domain/types';
import {
  cardSelector,
  evaluateCondition,
  getActiveState,
  getAffectedCardsByBoardEffects,
  getEffectiveProductions,
  getRemovedResourcesForState,
  removeResourceKeys,
} from './cardSelector';
import {
  getPayableResourceCostVariants,
  getSourceResourceEquivalence,
} from './resourceEquivalence';
import { fixResources, mergeResources } from './resources';

export {
  evaluateCondition,
  getActiveState,
  getAffectedCardsByBoardEffects,
  getEffectiveGlory,
  getEffectiveProductions,
  getTotalResourceProduction,
} from './cardSelector';

function sanitizeResources(resources: Resources): Resources {
  return Object.entries(resources).reduce<Resources>((acc, [key, value]) => {
    const clampedValue = Math.max(0, Number(value) || 0);
    if (clampedValue > 0) {
      acc[key as keyof Resources] = clampedValue;
    }
    return acc;
  }, {});
}

function removeResourceKeysFromCost(cost: Cost, keys: (keyof Resources)[]): Cost {
  if (keys.length === 0 || !cost.resources?.length) return cost;
  return {
    ...cost,
    resources: cost.resources.map(resourceCost =>
      removeResourceKeys(fixResources(resourceCost), keys),
    ),
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
        sanitizeResources(mergeResources(fixResources(cost), passive.resources as Resources)),
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

/** `amount` replaces an `'any'` resource amount: the amount the player chose to pay. */
export function getEffectiveActionCost(
  baseCost: Cost | undefined,
  instance: CardInstance,
  amount = 1,
): Cost {
  if (!baseCost) return {};
  const removedKeys = getRemovedResourcesForState(instance, instance.stateId, 'actionCost');
  const fixedCost = baseCost.resources
    ? { ...baseCost, resources: baseCost.resources.map(r => fixResources(r, amount)) }
    : baseCost;
  return removeResourceKeysFromCost(fixedCost, removedKeys);
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

/** Retourne la classe Tailwind de couleur de bordure associée à un tag (même palette que tagClass). */
export function tagBorderClass(tag: string, isEnemy: boolean): string {
  const t = tag.toLowerCase();
  if (isEnemy) return 'border-tag-enemy';
  if (t === 'building') return 'border-tag-building';
  if (t === 'person') return 'border-tag-person';
  if (t === 'seafaring') return 'border-tag-seafaring';
  if (t === 'land') return 'border-tag-land';
  if (t === 'livestock') return 'border-tag-livestock';
  return 'border-tag-tag';
}

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
            getPayableResourceCostVariants(
              fixResources(resourceCost),
              gameState.resources,
              equivalence,
            ).length > 0,
        )
      : canAffordResources(
          gameState.resources,
          cost.resources.map(r => fixResources(r)),
        );

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
