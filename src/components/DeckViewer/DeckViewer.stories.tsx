import type { Meta, StoryObj } from '@storybook/react';
import type { CardDef, CardInstance } from '@engine/types';
import { DeckViewer } from './DeckViewer';

const meta: Meta<typeof DeckViewer> = {
  title: 'game/DeckViewer',
  component: DeckViewer,
  parameters: { layout: 'centered' },
};

export default meta;
type Story = StoryObj<typeof DeckViewer>;

const defs: Record<number, CardDef> = {
  1: {
    id: 1,
    name: 'Plains',
    states: [{ id: 1, name: 'Plains', tags: ['Land'], productions: [{ gold: 2 }] }],
  },
  2: {
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
    ],
  },
  3: {
    id: 3,
    name: 'Forest',
    states: [{ id: 1, name: 'Forest', tags: ['Land'], productions: [{ wood: 1 }], glory: 1 }],
  },
  4: {
    id: 4,
    name: 'Iron Mine',
    states: [{ id: 1, name: 'Iron Mine', tags: ['Building'], productions: [{ iron: 1 }] }],
  },
};

function makeInst(cardId: number, stateId: number, deckEntryId: number): CardInstance {
  return {
    uid: `c${cardId}`,
    cardId,
    stateId,
    deckEntryId,
    stickers: [],
    blockedBy: null,
    trackProgress: null,
    tags: [],
  };
}

const instances: Record<string, CardInstance> = {
  c1: makeInst(1, 1, 1),
  c2: makeInst(2, 1, 2),
  c3: makeInst(3, 1, 3),
  c4: makeInst(4, 1, 4),
};

export const WithCards: Story = {
  args: {
    deck: ['c1', 'c2', 'c3', 'c4'],
    instances,
    defs,
  },
};

export const SingleCard: Story = {
  args: {
    deck: ['c1'],
    instances,
    defs,
  },
};

export const EmptyDeck: Story = {
  args: {
    deck: [],
    instances,
    defs,
  },
};
