import { servant } from './servant';
import { ResourceType } from '@deck-legacy/engine/domain/enums';

const { GOLD, WOOD, STONE } = ResourceType;

/** Useless Servant (Foundations 127): becomes the Ideal Servant. */
export const idealServant = servant(300, [
  { name: 'Lazy Servant', productions: [{ [GOLD]: 1 }], glory: -1, cost: { [GOLD]: 3 } },
  {
    name: 'Hardworking Servant',
    productions: [{ [GOLD]: 1, [WOOD]: 1 }],
    glory: 1,
    cost: { [GOLD]: 4 },
  },
  { name: 'Ideal Servant', productions: [{ [GOLD]: 1, [WOOD]: 1, [STONE]: 1 }], glory: 2 },
]);
