import { flipTo } from './flipTo';
import { ActionEffectType, CardTag, ResourceType } from '@deck-legacy/engine/domain/enums';
import type { CardAction, CardDef } from '@deck-legacy/engine/domain/types';

const SC = ResourceType.SCIENCE;

/** Spend `spend` science to gain `gain`, then turn to `next`. */
const experiment = (id: string, spend: number, gain: number, next: number): CardAction => ({
  id,
  ...(spend > 0 && { cost: { resources: [{ [SC]: spend }] } }),
  actionEffects: [
    { id: 1, type: ActionEffectType.ADD_RESOURCES, resources: { [SC]: gain } },
    flipTo(2, next),
  ],
});

/** Experiment (Foundations 59): resettable, the last side starts it again. */
export const experiments: CardDef = {
  id: 232,
  name: 'Experiment',
  states: [
    { id: 1, name: 'Experiment', tags: [CardTag.EVENT], actions: [experiment('232-1-1', 1, 2, 2)] },
    { id: 2, name: 'Experiment', tags: [CardTag.EVENT], actions: [experiment('232-2-1', 2, 4, 3)] },
    { id: 3, name: 'Experiment', tags: [CardTag.EVENT], actions: [experiment('232-3-1', 3, 6, 4)] },
    {
      id: 4,
      name: 'Replicate Experiment',
      tags: [CardTag.EVENT],
      actions: [experiment('232-4-1', 0, 2, 1)],
    },
  ],
};
