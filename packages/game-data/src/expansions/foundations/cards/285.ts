import { ARTISANS_CARDS } from './artisansConstants';
import {
  ActionEffectType,
  CardTag,
  PassiveType,
  ResourceType,
  TargetScope,
} from '@deck-legacy/engine/domain/enums';
import type { CardAction, CardDef } from '@deck-legacy/engine/domain/types';

const { IRON, GOODS } = ResourceType;

const discover = (id: string, ids: number[]): CardAction => ({
  id,
  endsTurn: true,
  condition: { type: 'cardCount', cards: { ids, scope: [TargetScope.DISCOVERY] }, min: 1 },
  actionEffects: [
    {
      id: 1,
      type: ActionEffectType.DISCOVER_CARD,
      cards: { ids, scope: [TargetScope.DISCOVERY], pickNumber: 1 },
    },
  ],
});

/** Glassblower / Jeweler (Foundations 112): a side chosen when discovered. */
export const glassblower: CardDef = {
  id: 285,
  name: 'Glassblower',
  chooseState: [1, 2],
  states: [
    {
      id: 1,
      name: 'Glassblower',
      tags: [CardTag.PERSON],
      productions: [{ [GOODS]: 3 }],
      actions: [discover('285-1-1', [ARTISANS_CARDS.glassWindows])],
    },
    {
      id: 2,
      name: 'Jeweler',
      tags: [CardTag.PERSON],
      productions: [{ [GOODS]: 1 }],
      // When you gain iron, you may instead gain goods
      passives: [
        { id: '285-2-1', type: PassiveType.REPLACE_GAIN, resources: { [IRON]: 1, [GOODS]: 1 } },
      ],
      actions: [discover('285-2-1', ARTISANS_CARDS.jewelry)],
    },
  ],
};
