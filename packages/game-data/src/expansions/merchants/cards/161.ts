import {
  ActionEffectType,
  CardTag,
  PassiveType,
  TargetScope,
  Trigger,
} from '@deck-legacy/engine/domain/enums';
import type { CardDef, StepDef } from '@deck-legacy/engine/domain/types';
import { CardPassives } from '@deck-legacy/engine/domain/types/effects';

const beerStep = (id: number): StepDef => ({
  id,
  effects: [
    {
      id: 1,
      type: ActionEffectType.PLAY_CARD,
      cards: { scope: [TargetScope.DISCARD], tags: [CardTag.PERSON], pickMin: 0, pickMax: 2 },
    },
  ],
});

const persons = { scope: [TargetScope.DRAWN], tags: [CardTag.PERSON] };

export const beer: CardDef = {
  id: 161,
  name: 'Beer',
  states: [
    {
      id: 1,
      name: 'Beer',
      tags: [CardTag.ITEM],
      actions: [
        {
          id: '161-1-1',
          actionEffects: [
            { id: 1, type: ActionEffectType.TRACK_ADVANCE, cards: { scope: [TargetScope.SELF] } },
          ],
        },
        {
          id: '161-1-2',
          trigger: Trigger.ON_TRACK_END,
          actionEffects: [
            {
              id: 1,
              type: ActionEffectType.UPGRADE_CARD,
              cards: { scope: [TargetScope.SELF] },
              states: { ids: [2] },
            },
          ],
        },
      ],
      track: { inOrder: true, steps: [1, 2, 3, 4, 5].map(beerStep) },
    },
    {
      id: 2,
      name: 'Hangover',
      tags: [CardTag.EVENT],
      negative: true,
      passives: [CardPassives[PassiveType.STAY_IN_PLAY]],
      actions: [
        {
          // Persons already in play when Hangover is played are spared.
          id: '161-2-1',
          trigger: Trigger.ON_PLAY,
          triggeredBy: persons,
          condition: { type: 'not', condition: { type: 'justPlayed' } },
          actionEffects: [
            {
              id: 1,
              type: ActionEffectType.TRACK_ADVANCE,
              cards: { scope: [TargetScope.SELF] },
              valuePerElement: { amount: 1, cards: persons },
            },
            {
              id: 2,
              type: ActionEffectType.DISCARD_CARD,
              cards: { ...persons, autoPick: true },
            },
          ],
        },
        {
          id: '161-2-2',
          trigger: Trigger.ON_TRACK_END,
          actionEffects: [
            { id: 1, type: ActionEffectType.DESTROY_CARD, cards: { scope: [TargetScope.SELF] } },
          ],
        },
      ],
      track: { inOrder: true, steps: [6, 7, 8, 9, 10].map(id => ({ id })) },
    },
  ],
};
