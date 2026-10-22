import { servant } from './servant';
import { ResourceType } from '@deck-legacy/engine/domain/enums';

const { GOLD, WOOD, GOODS } = ResourceType;

/** Useless Servant (Foundations 128): becomes the Craftsman (the slash: one or the other). */
export const craftsman = servant(301, [
  {
    name: 'Inept Craftsman',
    productions: [{ [GOLD]: 1 }, { [WOOD]: 1 }],
    glory: -1,
    cost: { [GOLD]: 4 },
  },
  {
    name: 'Decent Craftsman',
    productions: [{ [GOLD]: 1 }, { [WOOD]: 1 }, { [GOODS]: 1 }],
    glory: 1,
    cost: { [GOODS]: 2, [WOOD]: 2, [GOLD]: 2 },
  },
  { name: 'Craftsman', productions: [{ [GOLD]: 1, [WOOD]: 1, [GOODS]: 1 }], glory: 5 },
]);
