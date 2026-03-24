import type { Meta, StoryObj } from '@storybook/react';
import type { CardDef, CardInstance } from '@engine/types';
import { CardStatePreview } from './CardStatePreview';

const meta: Meta<typeof CardStatePreview> = {
  title: 'game/CardStatePreview',
  component: CardStatePreview,
  parameters: {
    layout: 'centered',
  },
};

export default meta;
type Story = StoryObj<typeof CardStatePreview>;

// CardStatePreview only renders (and shows a button) when def has > 1 state
const defsMultiState: Record<number, CardDef> = {
  10: {
    id: 10,
    name: 'Iron Mine',
    states: [
      {
        id: 1,
        name: 'Iron Mine',
        tags: ['Building'],
        productions: [{ iron: 1 }],
        upgrade: [{ cost: { resources: [{ gold: 3 }] }, upgradeTo: 2 }],
      },
      {
        id: 2,
        name: 'Iron Mine+',
        tags: ['Building'],
        productions: [{ iron: 2, gold: 1 }],
        glory: 1,
      },
    ],
  },
  11: {
    id: 11,
    name: 'Cathedral',
    states: [
      {
        id: 1,
        name: 'Cathedral (Ruin)',
        tags: ['Building'],
        productions: [{ stone: 1 }],
        upgrade: [{ cost: { resources: [{ stone: 5 }] }, upgradeTo: 2 }],
      },
      {
        id: 2,
        name: 'Cathedral',
        tags: ['Building', 'Monument'],
        productions: [{ stone: 1 }],
        glory: 3,
        stayInPlay: true,
      },
      {
        id: 3,
        name: 'Grand Cathedral',
        tags: ['Building', 'Monument'],
        productions: [{ stone: 2 }],
        glory: 5,
        stayInPlay: true,
      },
    ],
  },
};

const instanceAtLevel1: CardInstance = {
  uid: 'b1',
  cardId: 10,
  stateId: 1,
  deckEntryId: 5,
  stickers: [],
  blockedBy: null,
  trackProgress: null,
  tags: ['Building'],
};

const instanceAtLevel2: CardInstance = {
  uid: 'b2',
  cardId: 10,
  stateId: 2,
  deckEntryId: 6,
  stickers: [],
  blockedBy: null,
  trackProgress: null,
  tags: ['Building'],
};

const cathedralInstance: CardInstance = {
  uid: 'b3',
  cardId: 11,
  stateId: 2,
  deckEntryId: 7,
  stickers: [],
  blockedBy: null,
  trackProgress: null,
  tags: ['Building', 'Monument'],
};

export const TwoStates: Story = {
  args: { instance: instanceAtLevel1, defs: defsMultiState },
};

export const AtUpgradedState: Story = {
  args: { instance: instanceAtLevel2, defs: defsMultiState },
};

export const ThreeStates: Story = {
  args: { instance: cathedralInstance, defs: defsMultiState },
};
