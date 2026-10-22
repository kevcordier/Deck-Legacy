import { PassiveType, TargetScope } from '../enums';
import { getOfferedResources } from '../resources/getOfferedResources';
import { mergeResources } from '../resources/mergeResources';
import type { CardDef, CardInstance, GameState, Passive, Resources, Sticker } from '../types';
import { keepGainableResources } from './keepGainableResources';
import { sanitizeResources } from './sanitizeResources';
import { cardSelector } from './selection/cardSelector';
import { getActiveState } from './selection/getActiveState';
import { getEffectiveProductions } from './selection/getEffectiveProductions';
import { getEquipment } from './selection/getEquipment';

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

  // REPLACE_GAIN (Jeweler) applies to every card's production
  const gainPassives = Object.values(gameState.boardEffects)
    .flat()
    .filter(passive => passive.type === PassiveType.REPLACE_GAIN);
  return [...statePassives, ...boardEffectPassives, ...gainPassives]
    .filter(
      passive =>
        passive.type === PassiveType.REPLACE_RESOURCE_PRODUCTION ||
        passive.type === PassiveType.REPLACE_GAIN,
    )
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

/** The ADD_PRODUCTION_CHOICE passives on the card: each adds one of its bonuses (Archbishops). */
function getProductionChoiceBonuses(
  instance: CardInstance,
  gameState: GameState,
  defs: Record<number, CardDef>,
  stickerDefs: Record<number, Sticker>,
): NonNullable<Passive['choices']>[] {
  return Object.entries(gameState.boardEffects).flatMap(([sourceId, passives]) =>
    passives
      .filter(
        passive =>
          passive.type === PassiveType.ADD_PRODUCTION_CHOICE &&
          passive.choices &&
          cardSelector(
            passive.cards ?? { scope: [TargetScope.ANY] },
            Number(sourceId),
            gameState,
            defs,
            stickerDefs,
          ).includes(instance.id),
      )
      .map(passive => passive.choices ?? []),
  );
}

/** The bonuses a choice can get: 'produced' = +1 of a resource it produces, 'any' = any one. */
function bonusesFor(
  bonuses: NonNullable<Passive['choices']>,
  choice: Resources,
  gameState: GameState,
): Resources[] {
  if (bonuses === 'any') return getOfferedResources(gameState).map(type => ({ [type]: 1 }));
  if (bonuses !== 'produced') return bonuses;
  const produced = Object.entries(choice).filter(([, value]) => (value ?? 0) > 0);
  return produced.length > 0 ? produced.map(([type]) => ({ [type]: 1 })) : [{}];
}

/** The production of the cards equipped to this one (the equipment no longer produces itself). */
function getEquipmentProduction(
  instance: CardInstance,
  gameState: GameState,
  defs: Record<number, CardDef>,
  stickerDefs: Record<number, Sticker>,
): Resources {
  return getEquipment(gameState, instance.id).reduce<Resources>((total, equipmentId) => {
    const equipment = gameState.instances[equipmentId];
    const base = getActiveState(equipment, defs).productions?.[0] ?? {};
    return mergeResources(
      total,
      getEffectiveProductions(base, gameState, defs, equipment, stickerDefs, false),
    );
  }, {});
}

/** The MULTIPLY_PRODUCTION passives on the card, multiplied together (Guinevere: × 2). */
function getProductionFactor(
  instance: CardInstance,
  gameState: GameState,
  defs: Record<number, CardDef>,
  stickerDefs: Record<number, Sticker>,
): number {
  return Object.entries(gameState.boardEffects)
    .flatMap(([sourceId, passives]) =>
      passives.filter(
        passive =>
          passive.type === PassiveType.MULTIPLY_PRODUCTION &&
          cardSelector(
            passive.cards ?? { scope: [TargetScope.ANY] },
            Number(sourceId),
            gameState,
            defs,
            stickerDefs,
          ).includes(instance.id),
      ),
    )
    .reduce((factor, passive) => factor * (passive.amount ?? 1), 1);
}

export function getProductionChoicesForAction(
  base: Resources,
  gameState: GameState,
  defs: Record<number, CardDef>,
  instance: CardInstance,
  stickerDefs: Record<number, Sticker>,
): Resources[] {
  const baseProduction = mergeResources(
    getEffectiveProductions(base, gameState, defs, instance, stickerDefs),
    getEquipmentProduction(instance, gameState, defs, stickerDefs),
  );
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

  for (const bonuses of getProductionChoiceBonuses(instance, gameState, defs, stickerDefs)) {
    choices = choices.flatMap(choice =>
      bonusesFor(bonuses, choice, gameState).map(bonus => mergeResources(choice, bonus)),
    );
  }

  const factor = getProductionFactor(instance, gameState, defs, stickerDefs);
  if (factor !== 1) {
    choices = choices.map(choice =>
      Object.fromEntries(
        Object.entries(choice).map(([key, value]) => [key, (value ?? 0) * factor]),
      ),
    );
  }

  choices.forEach(choice => {
    unique.set(serialize(choice), choice);
  });

  return [...unique.values()].map(choice => keepGainableResources(choice, gameState));
}
