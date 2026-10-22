import { CardTag, ResourceType } from '@deck-legacy/engine/domain/enums';
import type { CardDef, CardState, Resources } from '@deck-legacy/engine/domain/types';

const GOLD = ResourceType.GOLD;

type Stage = { name: string; productions?: Resources[]; glory: number; cost?: Resources };

const USELESS_SERVANT: Stage = { name: 'Useless Servant', glory: -2, cost: { [GOLD]: 3 } };

/** A Useless Servant growing into a better one (Foundations 127, 128): `next` are stages 2–4. */
export function servant(id: number, next: Stage[]): CardDef {
  const stages = [USELESS_SERVANT, ...next];
  return {
    id,
    name: stages[0].name,
    states: stages.map(({ name, productions, glory, cost }, index): CardState => ({
      id: index + 1,
      name,
      tags: [CardTag.PERSON],
      ...(productions && { productions }),
      glory: { amount: glory },
      ...(cost && { upgrade: [{ cost: { resources: [cost] }, upgradeTo: index + 2 }] }),
    })),
  };
}
