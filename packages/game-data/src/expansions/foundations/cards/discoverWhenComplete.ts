import { ActionEffectType, TargetScope, Trigger } from '@deck-legacy/engine/domain/enums';
import type { CardAction } from '@deck-legacy/engine/domain/types';

/** "When complete, discover X" (in the box). */
export const discoverWhenComplete = (id: string, instanceId: number): CardAction => ({
  id,
  trigger: Trigger.ON_TRACK_END,
  condition: {
    type: 'cardCount',
    cards: { ids: [instanceId], scope: [TargetScope.DISCOVERY] },
    min: 1,
  },
  actionEffects: [{ id: 1, type: ActionEffectType.DISCOVER_CARD, cards: { ids: [instanceId] } }],
});
