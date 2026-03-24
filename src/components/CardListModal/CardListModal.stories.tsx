import type { Meta, StoryObj } from '@storybook/react';
import type { CardDef, CardInstance } from '@engine/types';
import { CardListModal } from './CardListModal';

const meta: Meta<typeof CardListModal> = {
  title: 'game/CardListModal',
  component: CardListModal,
  parameters: {
    layout: 'fullscreen',
  },
};

export default meta;
type Story = StoryObj<typeof CardListModal>;

const defs: Record<number, CardDef> = {
  1: {
    id: 1,
    name: 'Sawmill',
    states: [{ id: 1, name: 'Sawmill', tags: ['Building'], productions: [{ wood: 2 }] }],
  },
  2: {
    id: 2,
    name: 'Iron Mine',
    states: [
      { id: 1, name: 'Iron Mine', tags: ['Building'], productions: [{ iron: 1 }] },
      { id: 2, name: 'Iron Mine+', tags: ['Building'], productions: [{ iron: 2 }], glory: 1 },
    ],
  },
  3: {
    id: 3,
    name: 'Cathedral',
    states: [
      {
        id: 1,
        name: 'Cathedral',
        tags: ['Building', 'Monument'],
        productions: [{ stone: 1 }],
        glory: 3,
      },
    ],
  },
  4: {
    id: 4,
    name: 'Bandit Camp',
    states: [
      { id: 1, name: 'Bandit Camp', tags: ['Enemy'], productions: [{ sword: 1 }], glory: -1 },
    ],
  },
};

const instances: CardInstance[] = [
  {
    uid: 'a1',
    cardId: 1,
    stateId: 1,
    deckEntryId: 1,
    stickers: [],
    blockedBy: null,
    trackProgress: null,
    tags: ['Building'],
  },
  {
    uid: 'a2',
    cardId: 2,
    stateId: 2,
    deckEntryId: 2,
    stickers: [{ stickerNumber: 1, effect: { type: 'resource', resource: 'wood', amount: 1 } }],
    blockedBy: null,
    trackProgress: null,
    tags: ['Person'],
  },
  {
    uid: 'a3',
    cardId: 3,
    stateId: 1,
    deckEntryId: 3,
    stickers: [],
    blockedBy: null,
    trackProgress: null,
    tags: ['Land', 'Special'],
  },
  {
    uid: 'a4',
    cardId: 4,
    stateId: 1,
    deckEntryId: 4,
    stickers: [],
    blockedBy: null,
    trackProgress: null,
    tags: ['Enemy'],
  },
];

export const Default: Story = {
  args: {
    title: 'Tableau',
    subtitle: '4 cards in play',
    cards: instances,
    defs,
    onClose: () => {},
  },
};

export const Empty: Story = {
  args: {
    title: 'Discard Pile',
    cards: [],
    defs,
    onClose: () => {},
    emptyText: 'No cards discarded yet.',
  },
};

export const WithSubtitle: Story = {
  args: {
    title: 'Deck',
    subtitle: '12 cards remaining',
    cards: instances.slice(0, 2),
    defs,
    onClose: () => {},
  },
};
