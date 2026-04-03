import type { Meta, StoryObj } from '@storybook/react';
import { DeckViewer } from './DeckViewer';
import type { CardDef, CardInstance } from '@engine/domain/types';
import { CardTag } from '@engine/domain/enums';

const meta: Meta<typeof DeckViewer> = {
  title: 'Components/DeckViewer',
  component: DeckViewer,
  parameters: {
    layout: 'padded',
  },
};

export default meta;
type Story = StoryObj<typeof DeckViewer>;

// --- Shared mock data ---

const defs: Record<number, CardDef> = {
  1: {
    id: 1,
    name: 'Ferme',
    states: [
      {
        id: 1,
        name: 'Ferme',
        tags: [CardTag.BUILDING, CardTag.LAND],
        productions: [{ wood: 2 }],
      },
    ],
  },
  2: {
    id: 2,
    name: 'Forgeron',
    states: [
      {
        id: 1,
        name: 'Forgeron',
        tags: [CardTag.PERSON],
        productions: [{ gold: 1 }],
      },
    ],
  },
  3: {
    id: 3,
    name: 'Village',
    states: [
      {
        id: 1,
        name: 'Village',
        tags: [CardTag.BUILDING],
        productions: [{ stone: 1, gold: 1 }],
        glory: 2,
      },
    ],
  },
  4: {
    id: 4,
    name: 'Pillard',
    states: [
      {
        id: 1,
        name: 'Pillard',
        tags: [CardTag.ENEMY],
        glory: -3,
      },
    ],
  },
};

const instances: Record<number, CardInstance> = {
  1: { id: 1, cardId: 1, stateId: 1, stickers: {}, trackProgress: [] },
  2: { id: 2, cardId: 2, stateId: 1, stickers: {}, trackProgress: [] },
  3: { id: 3, cardId: 3, stateId: 1, stickers: {}, trackProgress: [] },
  4: { id: 4, cardId: 4, stateId: 1, stickers: {}, trackProgress: [] },
};

export const Default: Story = {
  args: {
    deck: [1, 2, 3, 4],
    instances,
    defs,
  },
};

export const SingleCard: Story = {
  args: {
    deck: [1],
    instances,
    defs,
  },
};

export const Empty: Story = {
  args: {
    deck: [],
    instances,
    defs,
  },
};
