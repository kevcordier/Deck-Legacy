import type { Meta, StoryObj } from '@storybook/react';
import { CardStatePreview } from './CardStatePreview';
import type { CardDef, CardInstance } from '@engine/domain/types';
import { CardTag, ActionType } from '@engine/domain/enums';

const meta: Meta<typeof CardStatePreview> = {
  title: 'Components/CardStatePreview',
  component: CardStatePreview,
  parameters: {
    layout: 'centered',
  },
};

export default meta;
type Story = StoryObj<typeof CardStatePreview>;

// --- Card with 2 states (upgrade path) ---

const villageDef: CardDef = {
  id: 3,
  name: 'Village',
  states: [
    {
      id: 1,
      name: 'Village',
      tags: [CardTag.BUILDING],
      productions: [{ gold: 1 }],
      upgrade: [{ cost: { resources: [{ stone: 2 }] }, upgradeTo: 2 }],
    },
    {
      id: 2,
      name: 'Cité',
      tags: [CardTag.BUILDING],
      productions: [{ gold: 3 }],
      glory: 2,
    },
  ],
};

const villageInstance: CardInstance = {
  id: 3,
  cardId: 3,
  stateId: 1,
  stickers: {},
  trackProgress: [],
};

// --- Card with 3 states ---

const armyDef: CardDef = {
  id: 6,
  name: 'Armée',
  states: [
    {
      id: 1,
      name: 'Milice',
      tags: [CardTag.PERSON],
      productions: [{ weapon: 1 }],
    },
    {
      id: 2,
      name: 'Armée',
      tags: [CardTag.PERSON],
      productions: [{ weapon: 2 }],
      cardEffects: [
        {
          label: 'Attaquer',
          actions: [{ id: 1, type: ActionType.DESTROY_CARD, cards: { scope: undefined } }],
        },
      ],
    },
    {
      id: 3,
      name: 'Armée aguerrie',
      tags: [CardTag.PERSON],
      productions: [{ weapon: 3 }],
      glory: 5,
    },
  ],
};

const armyInstance: CardInstance = {
  id: 6,
  cardId: 6,
  stateId: 2,
  stickers: {},
  trackProgress: [],
};

// --- Single-state card (button should not render) ---

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

const farmInstance: CardInstance = {
  id: 1,
  cardId: 1,
  stateId: 1,
  stickers: {},
  trackProgress: [],
};

export const TwoStates: Story = {
  name: 'Card with 2 states',
  args: {
    instance: villageInstance,
    defs: { 3: villageDef },
  },
};

export const ThreeStates: Story = {
  name: 'Card with 3 states (on state 2)',
  args: {
    instance: armyInstance,
    defs: { 6: armyDef },
  },
};

export const SingleState: Story = {
  name: 'Single-state card (button hidden)',
  args: {
    instance: farmInstance,
    defs: { 1: farmDef },
  },
};
