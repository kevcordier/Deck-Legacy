import { PassiveType, TargetScope } from '../../enums';
import { mergeResources } from '../../resources/mergeResources';
import type { CardDef, CardInstance, GameState, Resources, Sticker } from '../../types';
import { cardSelector } from './cardSelector';
import { countValuePerElement } from './countValuePerElement';
import { getRemovedResourcesForState } from './getRemovedResourcesForState';
import { removeResourceKeys } from './removeResourceKeys';

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
