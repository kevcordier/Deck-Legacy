import { destroySelf } from './destroySelf';
import { flipTo } from './flipTo';
import { ActionEffectType, CardTag, ResourceType } from '@deck-legacy/engine/domain/enums';
import type { CardAction, CardDef } from '@deck-legacy/engine/domain/types';

const SC = ResourceType.SCIENCE;

/** Spend `spend` science to gain twice as much, then turn to `next`. */
const experiment = (id: string, spend: number, next: number): CardAction => ({
  id,
  cost: { resources: [{ [SC]: spend }] },
  actionEffects: [
    { id: 1, type: ActionEffectType.ADD_RESOURCES, resources: { [SC]: spend * 2 } },
    flipTo(2, next),
  ],
});

/** Experiment (Foundations 84, 85): not resettable, the Results are destroyed. */
export const experiment84: CardDef = {
  id: 257,
  name: 'Experiment',
  states: [
    { id: 1, name: 'Experiment', tags: [CardTag.EVENT], actions: [experiment('257-1-1', 1, 2)] },
    { id: 2, name: 'Experiment', tags: [CardTag.EVENT], actions: [experiment('257-2-1', 2, 3)] },
    { id: 3, name: 'Experiment', tags: [CardTag.EVENT], actions: [experiment('257-3-1', 3, 4)] },
    {
      id: 4,
      name: 'Results',
      tags: [CardTag.EVENT],
      actions: [
        {
          id: '257-4-1',
          actionEffects: [
            destroySelf(1),
            { id: 2, type: ActionEffectType.ADD_RESOURCES, resources: { [SC]: 8 } },
          ],
        },
      ],
    },
  ],
};
