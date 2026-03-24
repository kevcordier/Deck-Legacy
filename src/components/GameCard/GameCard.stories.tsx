import type { Meta, StoryObj } from '@storybook/react';
import type { CardDef, CardInstance } from '@engine/types';
import { GameCard } from './GameCard';

const meta: Meta<typeof GameCard> = {
  title: 'game/GameCard',
  component: GameCard,
  args: {
    currentResources: { gold: 3, wood: 2 },
    activated: [],
    isInTableau: true,
    onActivate: () => {},
    onAction: () => {},
    onUpgrade: () => {},
  },
};

export default meta;
type Story = StoryObj<typeof GameCard>;

// --- Fixtures ---

const landDef: CardDef = {
  id: 1,
  name: 'Plains',
  states: [
    { id: 1, name: 'Wild Grass', tags: ['Land'], productions: [{ gold: 1 }] },
    {
      id: 2,
      name: 'Plains',
      tags: ['Land'],
      productions: [{ gold: 2 }],
      upgrade: [{ cost: { resources: [{ gold: 2 }] }, upgradeTo: 3 }],
    },
    { id: 3, name: 'Farmlands', tags: ['Land'], productions: [{ gold: 3 }], glory: 1 },
  ],
};

const buildingDef: CardDef = {
  id: 2,
  name: 'Sawmill',
  states: [
    {
      id: 1,
      name: 'Sawmill',
      tags: ['Building'],
      productions: [{ wood: 2 }],
      upgrade: [{ cost: { resources: [{ gold: 3 }] }, upgradeTo: 2 }],
    },
    { id: 2, name: 'Advanced Sawmill', tags: ['Building'], productions: [{ wood: 3 }], glory: 1 },
  ],
};

const enemyDef: CardDef = {
  id: 3,
  name: 'Bandit',
  states: [
    {
      id: 1,
      name: 'Bandit',
      tags: ['Enemy'],
      actions: [
        {
          label: 'Spend {{sword}} to defeat and gain 2 resources.',
          cost: { resources: [{ sword: 1 }], destroy: 'self' },
          effects: [{ type: 'add_resource' as const, resource: 'gold', amount: 2 }],
        },
      ],
    },
  ],
};

const traderDef: CardDef = {
  id: 4,
  name: 'Trader',
  states: [
    {
      id: 1,
      name: 'Trader',
      tags: ['Person'],
      actions: [
        {
          label: 'Spend {{gold}} to gain {{wood}}.',
          cost: { resources: [{ gold: 1 }] },
          effects: [{ type: 'add_resource' as const, resource: 'wood', amount: 1 }],
        },
      ],
    },
  ],
};

const gloryCathedralDef: CardDef = {
  id: 5,
  name: 'Cathedral',
  permanent: true,
  states: [
    {
      id: 1,
      name: 'Cathedral',
      tags: ['Building'],
      productions: [{ gold: 1 }],
      glory: 4,
      passives: [
        {
          label: 'This card has +1 {{gold}} production for each person you have in play.',
          effects: [
            {
              type: 'increase_production',
              target: 'self',
              resource: 'gold',
              amount_per_card: 1,
              card_scope: 'in_play',
              tags: ['Person'],
            },
          ],
        },
      ],
    },
  ],
};

const defs: Record<number, CardDef> = {
  1: landDef,
  2: buildingDef,
  3: enemyDef,
  4: traderDef,
  5: gloryCathedralDef,
};

function inst(cardId: number, stateId: number, overrides?: Partial<CardInstance>): CardInstance {
  return {
    uid: `card-${cardId}-${stateId}`,
    cardId,
    stateId,
    deckEntryId: cardId,
    stickers: [],
    blockedBy: null,
    trackProgress: null,
    tags: [],
    ...overrides,
  };
}

// --- Stories ---

export const LandCard: Story = {
  args: { instance: inst(1, 2), defs },
};

export const BuildingWithUpgrade: Story = {
  args: { instance: inst(2, 1), defs },
};

export const EnemyCard: Story = {
  args: {
    instance: inst(3, 1),
    defs,
    currentResources: { sword: 1 },
  },
};

export const EnemyBlocked: Story = {
  args: {
    instance: inst(3, 1, { blockedBy: 'card-1-2' }),
    defs,
  },
};

export const TraderWithAction: Story = {
  args: {
    instance: inst(4, 1),
    defs,
    currentResources: { gold: 2 },
  },
};

export const ActionNotAffordable: Story = {
  args: {
    instance: inst(4, 1),
    defs,
    currentResources: {},
  },
};

export const PermanentWithPassive: Story = {
  args: {
    instance: inst(5, 1),
    defs,
    currentResources: { gold: 1 },
  },
};

export const Activated: Story = {
  args: {
    instance: inst(1, 2),
    defs,
    activated: ['card-1-2'],
  },
};

export const WithSticker: Story = {
  args: {
    instance: inst(2, 1, {
      stickers: [{ stickerNumber: 1, effect: { type: 'resource', resource: 'wood', amount: 1 } }],
    }),
    defs,
  },
};

export const InDiscard: Story = {
  args: {
    instance: inst(1, 1),
    defs,
    isInTableau: false,
  },
};
