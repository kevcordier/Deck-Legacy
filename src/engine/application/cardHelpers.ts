import { getAffectedCardsByBoardEffects } from '@engine/application/boardEffectHelpers';
import { cardSelector } from '@engine/application/cardSelector';
import { mergeResources } from '@engine/application/gameStateHelper';
import { ActionType, PassiveType, TargetScope, Trigger } from '@engine/domain/enums';
import type {
  CardDef,
  CardInstance,
  CardState,
  Cost,
  GameState,
  Resources,
  Sticker,
  TriggerEntry,
} from '@engine/domain/types';

export { getAffectedCardsByBoardEffects };

export function getEffectiveProductions(
  base: Resources,
  activeState: CardState,
  gameState: GameState,
  defs: Record<number, CardDef>,
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

  let passiveBonus: Resources = {};
  for (const passive of activeState.passives ?? []) {
    if (passive.type === PassiveType.INCREASE_PRODUCTION && passive.resourcePerCard) {
      const { amount, resource, cards: sel } = passive.resourcePerCard;
      const count = cardSelector(sel, instance.id, gameState, defs).length;
      if (count > 0) {
        passiveBonus = mergeResources(passiveBonus, { [resource]: amount * count });
      }
    }
  }

  return mergeResources(mergeResources(base, stickerBonus), passiveBonus);
}

export function tagClass(tag: string, isEnemy: boolean): string {
  const t = tag.toLowerCase();
  let tagClass = 'bg-base-ink/10 border border-base-ink/20';
  if (isEnemy) tagClass += ' bg-red-500/10 border-red-500/20';
  if (t === 'building') tagClass += ' bg-gray-500/10 border-gray-300/20';
  if (t === 'person') tagClass += ' bg-yellow-500/10 border-yellow-500/20';
  if (t === 'seafaring') tagClass += ' bg-sky-500/10 border-sky-300/20';
  if (t === 'land') tagClass += ' bg-green-500/10 border-green-500/20';
  if (t === 'livestock') tagClass += ' bg-orange-500/10 border-orange-500/20';
  return tagClass;
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
    const effects = state.actions?.filter(ce => ce.trigger === effect) ?? [];
    if (effect === Trigger.ON_DISCOVER && cardDef.chooseState) {
      effects.push({
        id: 'choose_state',
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
