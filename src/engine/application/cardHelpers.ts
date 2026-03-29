import type {
  CardDef,
  CardState,
  CardInstance,
  Cost,
  Resources,
  Sticker,
  EffectDef,
} from '@engine/domain/types';
import { mergeResources } from '@engine/application/resourceHelpers';
import type { Trigger } from '@engine/domain/enums';

export function getEffectiveProductions(
  cs: CardState,
  instance: CardInstance,
  stickers: Record<number, Sticker> = {},
): Resources {
  const raw = cs.productions;
  const base: Resources = (raw as Resources[] | undefined)?.[0] ?? {};

  const stickerBonus = (instance.stickers[instance.stateId] ?? []).reduce<Resources>(
    (acc, stickerId) => {
      const sticker = stickers[stickerId];
      if (!sticker) return acc;
      if (sticker.type === 'add' && sticker.production) {
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

  return mergeResources(base, stickerBonus);
}

export function tagClass(tag: string): string {
  const t = tag.toLowerCase();
  if (t === 'enemy' || t === 'ennemy') return 'tag tag-enemy';
  if (t === 'building') return 'tag tag-building';
  if (t === 'seafaring') return 'tag tag-seafaring';
  if (t === 'event') return 'tag tag-event';
  return 'tag';
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
export function canAffordResources(available: Resources, cost: Cost): boolean {
  if (!cost.resources?.[0]) return true;
  return Object.entries(cost.resources[0]).every(
    ([k, v]) => (available[k as keyof Resources] ?? 0) >= v,
  );
}

/** Alias de canAffordResources pour compatibilité avec le code existant. */
export const canAffordCost = canAffordResources;

export function getInstancesTriggerEffects(
  instances: CardInstance[],
  defs: Record<number, CardDef>,
  effect: Trigger,
): EffectDef[] {
  return instances.reduce<EffectDef[]>((acc, instance) => {
    const state = getActiveState(instance, defs);
    const effects = state.cardEffects?.filter(ce => ce.trigger === effect) ?? [];
    return [...acc, ...effects];
  }, []);
}
