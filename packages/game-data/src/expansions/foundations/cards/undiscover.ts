import { ActionEffectType, TargetScope } from '@deck-legacy/engine/domain/enums';
import type { ActionEffect } from '@deck-legacy/engine/domain/types';

/**
 * "Undiscover this": reset (`reset`, a card with several states), then back in serial order in
 * the campaign deck while the campaign is played, destroyed instead afterwards (the back of the
 * campaign card). Effect ids from `id`.
 */
export function undiscover(id: number, campaign: string, reset = false): ActionEffect[] {
  const active = { type: 'expansionActive' as const, name: campaign };
  return [
    ...(reset
      ? [
          {
            id: id + 2,
            type: ActionEffectType.UPGRADE_CARD,
            cards: { scope: [TargetScope.SELF] },
            states: { ids: [1] },
            condition: active,
          },
        ]
      : []),
    {
      id,
      type: ActionEffectType.PLACE_CARD_IN_PILE,
      cards: { scope: [TargetScope.SELF] },
      deck: 'discovery',
      position: 'index',
      condition: active,
    },
    {
      id: id + 1,
      type: ActionEffectType.DESTROY_CARD,
      cards: { scope: [TargetScope.SELF] },
      condition: { type: 'not', condition: active },
    },
  ];
}
