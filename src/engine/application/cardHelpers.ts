import type {
  CardDef,
  CardState,
  CardInstance,
  Cost,
  Resources,
  Sticker,
  TriggerEntry,
} from '@engine/domain/types';
import { mergeResources } from '@engine/application/resourceHelpers';
import { ActionType, TargetScope, Trigger } from '@engine/domain/enums';

export function getEffectiveProductions(
  base: Resources,
  instance: CardInstance,
  stickers: Record<number, Sticker> = {},
): Resources {
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

/** Retourne la gloire totale gagnée via les steps de track validés. */
export function getTrackGlory(instance: CardInstance, cs: CardState): number {
  if (!cs.track || instance.trackProgress.length === 0) return 0;
  return cs.track.steps.reduce((sum, step) => {
    if (instance.trackProgress.includes(step.id)) {
      return sum + (step.onClick.glory ?? 0);
    }
    return sum;
  }, 0);
}

export function getInstancesTriggerEffects(
  instances: CardInstance[],
  defs: Record<number, CardDef>,
  effect: Trigger,
): TriggerEntry[] {
  return instances.reduce<TriggerEntry[]>((acc, instance) => {
    const state = getActiveState(instance, defs);
    const cardDef = defs[instance.cardId];
    const effects = state.cardEffects?.filter(ce => ce.trigger === effect) ?? [];
    if (effect === Trigger.ON_DISCOVER && cardDef.chooseState) {
      effects.push({
        label: 'Choose state',
        actions: [
          {
            id: 0,
            type: ActionType.CHOOSE_STATE,
            cards: { scope: TargetScope.SELF },
            states: [1, 2],
          },
        ],
        trigger: Trigger.ON_DISCOVER,
        optional: false,
      });
    }
    return [...acc, ...effects.map(effectDef => ({ effectDef, sourceInstanceId: instance.id }))];
  }, [] as TriggerEntry[]);
}
