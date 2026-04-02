import type { Meta, StoryObj } from '@storybook/react';
import { GameCard } from './GameCard';
import type { CardDef, CardInstance } from '@engine/domain/types';
import { CardTag } from '@engine/domain/enums';

const meta: Meta<typeof GameCard> = {
  title: 'Components/GameCard',
  component: GameCard,
  parameters: {
    layout: 'centered',
  },
  argTypes: {
    isOnBoard: { control: 'boolean' },
    isBlocked: { control: 'boolean' },
    hideStatePreview: { control: 'boolean' },
    onActivate: { action: 'activated' },
    onAction: { action: 'action' },
    onUpgrade: { action: 'upgrade' },
  },
};

export default meta;
type Story = StoryObj<typeof GameCard>;

// --- Shared mock data ---

const simpleDef: CardDef = {
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

const simpleInstance: CardInstance = {
  id: 1,
  cardId: 1,
  stateId: 1,
  stickers: {},
  trackProgress: null,
};

const defs: Record<number, CardDef> = { 1: simpleDef };

// --- Card with actions ---

const actionDef: CardDef = {
  id: 2,
  name: 'Forgeron',
  states: [
    {
      id: 1,
      name: 'Forgeron',
      tags: [CardTag.PERSON, CardTag.BUILDING],
      productions: [{ gold: 1 }],
      cardEffects: [
        {
          label: 'Forger',
          actions: [],
          cost: { resources: [{ iron: 1 }] },
        },
      ],
    },
  ],
};

const actionInstance: CardInstance = {
  id: 2,
  cardId: 2,
  stateId: 1,
  stickers: {},
  trackProgress: null,
};

// --- Card with upgrade ---

const upgradeDef: CardDef = {
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

const upgradeInstance: CardInstance = {
  id: 3,
  cardId: 3,
  stateId: 1,
  stickers: {},
  trackProgress: null,
};

// --- Enemy card ---

const enemyDef: CardDef = {
  id: 4,
  name: 'Pillard',
  states: [
    {
      id: 1,
      name: 'Pillard',
      tags: ['enemy' as CardTag],
      cardEffects: [
        {
          label: 'Attaquer',
          actions: [],
        },
      ],
    },
  ],
};

const enemyInstance: CardInstance = {
  id: 4,
  cardId: 4,
  stateId: 1,
  stickers: {},
  trackProgress: null,
};

// --- Permanent card with glory ---

const gloryDef: CardDef = {
  id: 5,
  name: 'Château',
  permanent: true,
  states: [
    {
      id: 1,
      name: 'Château',
      tags: [CardTag.BUILDING],
      productions: [{ gold: 2, goods: 1 }],
      glory: 5,
    },
  ],
};

const gloryInstance: CardInstance = {
  id: 5,
  cardId: 5,
  stateId: 1,
  stickers: {},
  trackProgress: null,
};

// --- Stories ---

export const SimpleCard: Story = {
  args: {
    instance: simpleInstance,
    defs,
    currentResources: { gold: 5, wood: 3 },
    isOnBoard: true,
  },
};

export const InHand: Story = {
  args: {
    instance: simpleInstance,
    defs,
    currentResources: {},
    isOnBoard: false,
  },
};

export const WithAction: Story = {
  args: {
    instance: actionInstance,
    defs: { 2: actionDef },
    currentResources: { iron: 2 },
    isOnBoard: true,
  },
};

export const WithActionAffordable: Story = {
  name: 'With Action (can afford)',
  args: {
    instance: actionInstance,
    defs: { 2: actionDef },
    currentResources: { iron: 2 },
    isOnBoard: true,
  },
};

export const WithActionNotAffordable: Story = {
  name: 'With Action (cannot afford)',
  args: {
    instance: actionInstance,
    defs: { 2: actionDef },
    currentResources: {},
    isOnBoard: true,
  },
};

export const WithUpgrade: Story = {
  args: {
    instance: upgradeInstance,
    defs: { 3: upgradeDef },
    currentResources: { stone: 2 },
    isOnBoard: true,
  },
};

export const Blocked: Story = {
  args: {
    instance: simpleInstance,
    defs,
    currentResources: {},
    isOnBoard: true,
    isBlocked: true,
  },
};

export const Enemy: Story = {
  args: {
    instance: enemyInstance,
    defs: { 4: enemyDef },
    currentResources: {},
    isOnBoard: true,
  },
};

export const PermanentWithGlory: Story = {
  args: {
    instance: gloryInstance,
    defs: { 5: gloryDef },
    currentResources: { gold: 5, goods: 2 },
    isOnBoard: true,
  },
};

export const UpgradedState: Story = {
  name: 'Upgraded state (Cité)',
  args: {
    instance: { ...upgradeInstance, stateId: 2 },
    defs: { 3: upgradeDef },
    currentResources: {},
    isOnBoard: true,
  },
};

export const AllCards: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', alignItems: 'flex-start' }}>
      <GameCard
        instance={simpleInstance}
        defs={defs}
        currentResources={{ gold: 2 }}
        isOnBoard={true}
      />
      <GameCard
        instance={actionInstance}
        defs={{ 2: actionDef }}
        currentResources={{ iron: 1 }}
        isOnBoard={true}
      />
      <GameCard
        instance={upgradeInstance}
        defs={{ 3: upgradeDef }}
        currentResources={{ stone: 3 }}
        isOnBoard={true}
      />
      <GameCard
        instance={gloryInstance}
        defs={{ 5: gloryDef }}
        currentResources={{}}
        isOnBoard={true}
      />
      <GameCard
        instance={enemyInstance}
        defs={{ 4: enemyDef }}
        currentResources={{}}
        isOnBoard={true}
      />
      <GameCard
        instance={simpleInstance}
        defs={defs}
        currentResources={{}}
        isOnBoard={true}
        isBlocked
      />
    </div>
  ),
};
