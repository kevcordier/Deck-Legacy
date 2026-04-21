import { cardSelector } from '@engine/application/cardSelector';
import { mergeResources } from '@engine/application/gameStateHelper';
import { ActionType, PassiveType, TargetScope, Trigger } from '@engine/domain/enums';
import type {
  ActionEffect,
  CardDef,
  CardInstance,
  CardState,
  Cost,
  GameState,
  Resources,
  StepDef,
  Sticker,
  TriggerEntry,
} from '@engine/domain/types';

export function getAffectedCardsByBoardEffects(
  gameState: GameState,
  passiveType: PassiveType,
): Record<number, number[]> {
  const affectedInstanceIds: Record<number, number[]> = {};
  Object.entries(gameState.boardEffects).forEach(([sourceId, effects]) =>
    effects
      .filter(be => be.type === passiveType)
      .forEach(be => {
        if (be.cards?.ids) {
          affectedInstanceIds[Number(sourceId)] = [
            ...(affectedInstanceIds[Number(sourceId)] ?? []),
            ...be.cards.ids,
          ];
        }
      }),
  );

  return affectedInstanceIds;
}

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
        actionEffects: [
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

export function getFirstAvailableTrackStep(
  actionEffects: ActionEffect[],
  instanceId: number,
  gameState: GameState,
  defs: Record<number, CardDef>,
): StepDef | undefined {
  const trackEffect = actionEffects.find(e => e.type === ActionType.TRACK_ADVANCE);
  if (!trackEffect?.cards) return undefined;

  const targetIds = cardSelector(trackEffect.cards, instanceId, gameState, defs);

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
