import { PassiveType, TargetScope } from '../enums';
import type { CardDef, CardInstance, GameState, Resources, Sticker } from '../types';
import { keepGainableResources } from './keepGainableResources';
import { sanitizeResources } from './sanitizeResources';
import { cardSelector } from './selection/cardSelector';
import { getActiveState } from './selection/getActiveState';
import { getEffectiveProductions } from './selection/getEffectiveProductions';

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

  return [...unique.values()].map(choice => keepGainableResources(choice, gameState));
}
