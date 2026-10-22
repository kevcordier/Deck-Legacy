import { equipAction } from './equipAction';
import { CardTag, PassiveType, ResourceType, TargetScope } from '@deck-legacy/engine/domain/enums';
import type { CardDef, Passive } from '@deck-legacy/engine/domain/types';

const IRON = ResourceType.IRON;
const RING = 312;
const TAGS = [CardTag.ITEM];
const holder = { scope: [TargetScope.HOLDER] };

const ringState = (
  id: number,
  name: string,
  glory: number,
  extra: { passive?: Passive; production?: boolean; upgradeCost?: number },
) => ({
  id,
  name,
  tags: TAGS,
  equip: CardTag.PERSON,
  glory: { amount: glory },
  ...(extra.production && { productions: [{ [ResourceType.GOLD]: 1 }] }),
  ...(extra.passive && { passives: [extra.passive] }),
  actions: [equipAction(`294-${id}-1`, CardTag.PERSON, RING)],
  ...(extra.upgradeCost && {
    upgrade: [{ cost: { resources: [{ [IRON]: extra.upgradeCost }] }, upgradeTo: id + 1 }],
  }),
});

/** Ring (Foundations 121): equipment of a person, its holder producing more. */
export const ring: CardDef = {
  id: 294,
  name: 'Ring',
  states: [
    ringState(1, 'Ring', 2, { production: true, upgradeCost: 2 }),
    ringState(2, 'Ornate Ring', 4, {
      upgradeCost: 3,
      passive: {
        id: '294-2-1',
        type: PassiveType.ADD_PRODUCTION_CHOICE,
        cards: holder,
        choices: 'produced',
      },
    }),
    ringState(3, 'Golden Ring', 6, {
      upgradeCost: 4,
      passive: {
        id: '294-3-1',
        type: PassiveType.ADD_PRODUCTION_CHOICE,
        cards: holder,
        choices: 'any',
      },
    }),
    ringState(4, 'Diamond Ring', 10, {
      passive: { id: '294-4-1', type: PassiveType.MULTIPLY_PRODUCTION, cards: holder, amount: 2 },
    }),
  ],
};
