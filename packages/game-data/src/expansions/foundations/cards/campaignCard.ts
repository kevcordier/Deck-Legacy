import { ActionEffectType, CardTag, TargetScope, Trigger } from '@deck-legacy/engine/domain/enums';
import type { ActionEffect, CardDef, StepDef } from '@deck-legacy/engine/domain/types';

/** Covers of the six foundations (instances): a green box discovers one not played yet. */
const FOUNDATION_COVERS = [236, 255, 279, 297, 314, 331];

const discoverFoundation: ActionEffect = {
  id: 2,
  type: ActionEffectType.DISCOVER_CARD,
  cards: { ids: FOUNDATION_COVERS, pickNumber: 1 },
};

/** A box of the round track: discover `count` cards of the campaign, and a foundation if green. */
const roundStep = (id: number, count: number, green = false): StepDef => ({
  id,
  effects: [
    ...(count > 0 ? [{ id: 1, type: ActionEffectType.ADVANCE_STORY, value: count }] : []),
    ...(green ? [discoverFoundation] : []),
  ],
});

/**
 * Campaign card of Foundations (EDR-059): a permanent whose round track discovers the campaign
 * cards. The campaign setup (`onStart.actions` in deck.json) marks the first box; the end of each
 * round marks the next one.
 */
export const campaignCard = (
  id: number,
  name: string,
  track: { count: number; green?: boolean }[],
): CardDef => ({
  id,
  name,
  states: [
    {
      id: 1,
      name,
      tags: [CardTag.PERMANENT],
      track: {
        inOrder: true,
        steps: track.map(({ count, green }, index) => roundStep(index + 1, count, green)),
      },
      actions: [
        {
          id: `${id}-1-1`,
          trigger: Trigger.END_OF_ROUND,
          actionEffects: [
            { id: 1, type: ActionEffectType.TRACK_ADVANCE, cards: { scope: [TargetScope.SELF] } },
          ],
        },
      ],
    },
  ],
});
