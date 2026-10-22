import { TargetScope } from '@deck-legacy/engine/domain/enums';
import type { Condition } from '@deck-legacy/engine/domain/types';

/** The equipment `instanceId` is equipped: its effects work (Chimney, Wagon, Children's Toy). */
export const isEquipped = (instanceId: number): Condition => ({
  type: 'cardCount',
  cards: { ids: [instanceId], scope: [TargetScope.SELF], equipped: true },
  min: 1,
});
