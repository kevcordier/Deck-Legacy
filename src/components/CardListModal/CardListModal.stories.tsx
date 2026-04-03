import type { Meta, StoryObj } from '@storybook/react';
import { CardListModal } from './CardListModal';
import type { CardDef, CardInstance } from '@engine/domain/types';
import { CardTag } from '@engine/domain/enums';

const meta: Meta<typeof CardListModal> = {
  title: 'Components/CardListModal',
  component: CardListModal,
  parameters: {
    layout: 'fullscreen',
  },
  argTypes: {
    onClose: { action: 'closed' },
  },
};

export default meta;
type Story = StoryObj<typeof CardListModal>;

// --- Shared mock data ---

const farmDef: CardDef = {
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
};

const smithDef: CardDef = {
  id: 2,
  name: 'Forgeron',
  states: [
    {
      id: 1,
      name: 'Forgeron',
      tags: [CardTag.PERSON, CardTag.BUILDING],
      productions: [{ gold: 1 }],
    },
  ],
};

const villageDef: CardDef = {
  id: 3,
  name: 'Village',
  states: [
    {
      id: 1,
      name: 'Village',
      tags: [CardTag.BUILDING],
      productions: [{ gold: 2, stone: 1 }],
    },
  ],
};

const instances: CardInstance[] = [
  { id: 1, cardId: 1, stateId: 1, stickers: {}, trackProgress: [] },
  { id: 2, cardId: 2, stateId: 1, stickers: {}, trackProgress: [] },
  { id: 3, cardId: 3, stateId: 1, stickers: {}, trackProgress: [] },
];

const defs: Record<number, CardDef> = { 1: farmDef, 2: smithDef, 3: villageDef };

export const WithCards: Story = {
  args: {
    title: 'Pile de défausse',
    subtitle: '3 cartes',
    cards: instances,
    defs,
  },
};

export const Empty: Story = {
  args: {
    title: 'Pile de défausse',
    cards: [],
    defs,
  },
};

export const EmptyWithCustomText: Story = {
  args: {
    title: 'Pioche',
    cards: [],
    defs,
    emptyText: 'La pioche est vide.',
  },
};

export const SingleCard: Story = {
  args: {
    title: 'Découverte',
    cards: [instances[0]],
    defs,
  },
};
