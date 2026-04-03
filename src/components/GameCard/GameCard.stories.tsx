import type { Meta, StoryObj } from '@storybook/react';
import { GameCard } from './GameCard';
import type { CardDef, CardInstance } from '@engine/domain/types';
import { ActionType, CardTag } from '@engine/domain/enums';

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
    onTrackStep: { action: 'trackStep' },
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
  trackProgress: [],
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
  trackProgress: [],
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
  trackProgress: [],
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
  trackProgress: [],
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
  trackProgress: [],
};

// --- Card with track (glory steps, inOrder) ---

const trackGloryDef: CardDef = {
  id: 6,
  name: 'Armée',
  permanent: true,
  states: [
    {
      id: 1,
      name: 'Armée',
      tags: [CardTag.LAND],
      track: {
        inOrder: true,
        cumulative: false,
        endsTurn: true,
        steps: [
          { id: 1, cost: { resources: [{ weapon: 1 }] }, onClick: { glory: 1 } },
          { id: 2, cost: { resources: [{ weapon: 2 }] }, onClick: { glory: 4 } },
          { id: 3, cost: { resources: [{ weapon: 3 }] }, onClick: { glory: 7 } },
          { id: 4, cost: { resources: [{ weapon: 4 }] }, onClick: { glory: 10 } },
          {
            id: 5,
            cost: { resources: [{ weapon: 5 }] },
            onClick: {
              actions: [
                { id: 1, type: ActionType.UPGRADE_CARD, cards: { scope: undefined }, states: [2] },
              ],
            },
          },
        ],
      },
    },
    {
      id: 2,
      name: 'Armée aguerrie',
      tags: [CardTag.LAND],
      glory: 12,
    },
  ],
};

const trackGloryInstance: CardInstance = {
  id: 6,
  cardId: 6,
  stateId: 1,
  stickers: {},
  trackProgress: [],
};

// --- Card with track (free steps, some validated) ---

const trackFreeDef: CardDef = {
  id: 7,
  name: 'Marché',
  permanent: true,
  states: [
    {
      id: 1,
      name: 'Marché',
      tags: [CardTag.BUILDING],
      track: {
        inOrder: false,
        cumulative: false,
        endsTurn: false,
        steps: [
          {
            id: 1,
            cost: { resources: [{ gold: 1 }] },
            onClick: {
              actions: [{ id: 1, type: ActionType.ADD_RESOURCES, resources: { wood: 2 } }],
            },
          },
          {
            id: 2,
            cost: { resources: [{ gold: 2 }] },
            onClick: {
              actions: [{ id: 1, type: ActionType.ADD_RESOURCES, resources: { stone: 1 } }],
            },
          },
          { id: 3, cost: { resources: [{ gold: 1 }] }, onClick: { glory: 3 } },
          {
            id: 4,
            cost: { resources: [{ gold: 3 }] },
            onClick: {
              actions: [
                {
                  id: 1,
                  type: ActionType.DISCOVER_CARD,
                  cards: { ids: [42] },
                },
              ],
            },
          },
        ],
      },
    },
  ],
};

const trackFreeInstance: CardInstance = {
  id: 7,
  cardId: 7,
  stateId: 1,
  stickers: {},
  trackProgress: [1, 3],
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

export const WithTrackInOrder: Story = {
  name: 'With Track (inOrder, glory steps)',
  args: {
    instance: trackGloryInstance,
    defs: { 6: trackGloryDef },
    currentResources: { weapon: 3 },
    isOnBoard: true,
  },
};

export const WithTrackInOrderPartialProgress: Story = {
  name: 'With Track (inOrder, 2 steps done)',
  args: {
    instance: { ...trackGloryInstance, trackProgress: [1, 2] },
    defs: { 6: trackGloryDef },
    currentResources: { weapon: 3 },
    isOnBoard: true,
  },
};

export const WithTrackFreeSteps: Story = {
  name: 'With Track (free steps, mixed content)',
  args: {
    instance: trackFreeInstance,
    defs: { 7: trackFreeDef },
    currentResources: { gold: 3 },
    isOnBoard: true,
  },
};

export const WithTrackNotAffordable: Story = {
  name: 'With Track (cannot afford any step)',
  args: {
    instance: trackGloryInstance,
    defs: { 6: trackGloryDef },
    currentResources: {},
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
      <GameCard
        instance={trackGloryInstance}
        defs={{ 6: trackGloryDef }}
        currentResources={{ weapon: 2 }}
        isOnBoard={true}
      />
      <GameCard
        instance={{ ...trackGloryInstance, trackProgress: [1, 2] }}
        defs={{ 6: trackGloryDef }}
        currentResources={{ weapon: 3 }}
        isOnBoard={true}
      />
      <GameCard
        instance={trackFreeInstance}
        defs={{ 7: trackFreeDef }}
        currentResources={{ gold: 2 }}
        isOnBoard={true}
      />
    </div>
  ),
};
