import { ActionEffectType, CardTag, ResourceType } from '@deck-legacy/engine/domain/enums';
import type { CardDef, Resources } from '@deck-legacy/engine/domain/types';

const SC = ResourceType.SCIENCE;

type Scholar = {
  id: number;
  names: [string, string, string, string];
  costs: [Resources, Resources, Resources];
  productions: [Resources | null, Resources, Resources];
  glory: number;
  breakthrough: number;
  chooseName?: boolean;
};

/** A person learning science, 4 states; the last one has a one-time Breakthrough. */
export const scholar = ({
  id,
  names,
  costs,
  productions,
  glory,
  breakthrough,
  chooseName,
}: Scholar): CardDef => ({
  id,
  name: names[0],
  states: [
    {
      id: 1,
      name: names[0],
      tags: [CardTag.PERSON],
      upgrade: [{ cost: { resources: [costs[0]] }, upgradeTo: 2 }],
    },
    {
      id: 2,
      name: names[1],
      tags: [CardTag.PERSON],
      ...(productions[0] && { productions: [productions[0]] }),
      upgrade: [{ cost: { resources: [costs[1]] }, upgradeTo: 3 }],
    },
    {
      id: 3,
      name: names[2],
      tags: [CardTag.PERSON],
      productions: [productions[1]],
      upgrade: [{ cost: { resources: [costs[2]] }, upgradeTo: 4 }],
    },
    {
      id: 4,
      name: names[3],
      ...(chooseName && { chooseName }),
      tags: [CardTag.PERSON],
      productions: [productions[2]],
      glory: { amount: glory },
      actions: [
        {
          id: `${id}-4-1`,
          limitedTime: 1,
          actionEffects: [
            { id: 1, type: ActionEffectType.ADD_RESOURCES, resources: { [SC]: breakthrough } },
          ],
        },
      ],
    },
  ],
});
