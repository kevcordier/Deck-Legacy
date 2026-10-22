import { CardTag, PassiveType, ResourceType } from '@deck-legacy/engine/domain/enums';
import type { CardDef } from '@deck-legacy/engine/domain/types';

const { STONE, WEAPON } = ResourceType;

/** Viscount Eemon / Frostpeak Fortress (Foundations 134): a side chosen when discovered. */
export const viscountEemon: CardDef = {
  id: 307,
  name: 'Viscount Eemon',
  chooseState: [1, 2],
  states: [
    {
      id: 1,
      name: 'Viscount Eemon',
      tags: [CardTag.PERSON],
      productions: [{ [STONE]: 2, [WEAPON]: 2 }],
    },
    {
      id: 2,
      name: 'Frostpeak Fortress',
      tags: [CardTag.BUILDING],
      glory: { amount: 5 },
      // The cards purged together with this are worth at least 5 glory
      passives: [{ id: '307-2-1', type: PassiveType.PURGE_MIN_GLORY, amount: 5 }],
    },
  ],
};
