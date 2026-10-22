import { undiscover } from './undiscover';
import {
  ActionEffectType,
  CardTag,
  PassiveType,
  ResourceType,
  TargetScope,
  Trigger,
} from '@deck-legacy/engine/domain/enums';
import type {
  ActionEffect,
  CardAction,
  CardDef,
  CardState,
} from '@deck-legacy/engine/domain/types';

const discardTopCard: ActionEffect = {
  id: 1,
  type: ActionEffectType.DISCARD_CARD,
  cards: { scope: [TargetScope.TOP_OF_DECK] },
};

/** Spend 2 swords to defeat: the troop shrinks (next state), the last enemy is undiscovered. */
const defeat = (stateId: number, effects: ActionEffect[]): CardAction => ({
  id: `192-${stateId}-2`,
  defeat: true,
  cost: { resources: [{ [ResourceType.WEAPON]: 2 }] },
  actionEffects: effects,
});

const troop = (id: number, name: string, glory: number, enemies: number): CardState => ({
  id,
  name,
  tags: [CardTag.ENEMY],
  negative: true,
  glory: { amount: glory },
  passives: [{ id: `192-${id}-1`, type: PassiveType.COUNT_AS, amount: enemies }],
  actions: [
    { id: `192-${id}-1`, trigger: Trigger.ON_PLAY, actionEffects: [discardTopCard] },
    defeat(id, [
      {
        id: 1,
        type: ActionEffectType.UPGRADE_CARD,
        cards: { scope: [TargetScope.SELF] },
        states: { ids: [id + 1] },
      },
    ]),
  ],
});

/** Enemy Troop (Foundations 19, 20, 24, 26): counts as several enemies, fewer at each defeat. */
export const enemyTroop: CardDef = {
  id: 192,
  name: 'Enemy Troop',
  states: [
    troop(1, 'Enemy Troop', -5, 5),
    troop(2, 'Small Troop', -3, 3),
    troop(3, 'Enemy Duo', -2, 2),
    {
      id: 4,
      name: 'Lone Enemy',
      tags: [CardTag.ENEMY],
      negative: true,
      glory: { amount: -1 },
      actions: [
        {
          id: '192-4-1',
          trigger: Trigger.ON_PLAY,
          actionEffects: [
            {
              id: 1,
              type: ActionEffectType.DISCARD_CARD,
              cards: { scope: [TargetScope.BOARD, TargetScope.FRIENDLY], pickNumber: 1 },
            },
          ],
        },
        defeat(4, undiscover(1, 'Invasion', true)),
      ],
    },
  ],
};
