import type { Meta, StoryObj } from '@storybook/react';
import type { CardDef, CardInstance } from '@engine/types';
import { DiscardPile } from './DiscardPile';

const meta: Meta<typeof DiscardPile> = {
  title: 'game/DiscardPile',
  component: DiscardPile,
  parameters: { layout: 'centered' },
};

export default meta;
type Story = StoryObj<typeof DiscardPile>;

const defs: Record<number, CardDef> = {
  1: {
    id: 1,
    name: 'Plains',
    states: [{ id: 1, name: 'Plains', tags: ['Land'], productions: [{ gold: 2 }] }],
  },
  2: {
    id: 2,
    name: 'Forest',
    states: [{ id: 1, name: 'Forest', tags: ['Land'], productions: [{ wood: 1 }], glory: 1 }],
  },
  3: {
    id: 3,
    name: 'Bandit',
    states: [{ id: 1, name: 'Bandit', tags: ['Enemy'] }],
  },
};

function makeInst(cardId: number, stateId: number, deckEntryId: number): CardInstance {
  return {
    uid: `d${cardId}`,
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
  d1: makeInst(1, 1, 1),
  d2: makeInst(2, 1, 2),
  d3: makeInst(3, 1, 3),
};

export const WithCards: Story = {
  args: {
    discard: ['d1', 'd2', 'd3'],
    instances,
    defs,
  },
};

export const SingleCard: Story = {
  args: {
    discard: ['d2'],
    instances,
    defs,
  },
};

export const Empty: Story = {
  args: {
    discard: [],
    instances,
    defs,
  },
};
