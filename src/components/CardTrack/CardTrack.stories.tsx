import { CardTrack } from './CardTrack';
import { ActionType } from '@engine/domain/enums';
import type { Meta, StoryObj } from '@storybook/react-vite';

const meta: Meta<typeof CardTrack> = {
  title: 'Components/CardTrack',
  component: CardTrack,
  parameters: {
    layout: 'centered',
  },
  argTypes: {
    size: {
      control: { type: 'radio' },
      options: ['sm', 'md', 'lg'],
    },
    onStep: { action: 'stepClicked' },
  },
};

export default meta;
type Story = StoryObj<typeof CardTrack>;

// --- Shared track definitions ---

const gloryTrack = {
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
        actions: [{ id: 1, type: ActionType.UPGRADE_CARD, cards: {}, states: [2] }],
      },
    },
  ],
};

const freeTrack = {
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
      onClick: { glory: 3 },
    },
    {
      id: 3,
      cost: { resources: [{ gold: 3 }] },
      onClick: {
        actions: [{ id: 1, type: ActionType.DISCOVER_CARD, cards: { ids: [42] } }],
      },
    },
    {
      id: 4,
      cost: { resources: [{ gold: 2 }] },
      onClick: {
        actions: [{ id: 1, type: ActionType.UPGRADE_CARD, cards: {}, states: [2] }],
      },
    },
  ],
};

const emptyStep = {
  inOrder: true,
  cumulative: false,
  endsTurn: false,
  steps: [
    { id: 1, cost: {}, onClick: {} },
    { id: 2, cost: {}, onClick: {} },
    { id: 3, cost: {}, onClick: {} },
  ],
};

// --- Stories ---

export const InOrderNoProgress: Story = {
  name: 'inOrder — no progress',
  args: {
    size: 'md',
    track: gloryTrack,
    validatedSteps: [],
    currentResources: { weapon: 3 },
    canActivate: true,
  },
};

export const InOrderPartialProgress: Story = {
  name: 'inOrder — 2 steps done',
  args: {
    size: 'md',
    track: gloryTrack,
    validatedSteps: [1, 2],
    currentResources: { weapon: 3 },
    canActivate: true,
  },
};

export const InOrderComplete: Story = {
  name: 'inOrder — all steps done',
  args: {
    size: 'md',
    track: gloryTrack,
    validatedSteps: [1, 2, 3, 4, 5],
    currentResources: {},
    canActivate: true,
  },
};

export const InOrderCannotAfford: Story = {
  name: 'inOrder — cannot afford next step',
  args: {
    size: 'md',
    track: gloryTrack,
    validatedSteps: [1],
    currentResources: { weapon: 1 },
    canActivate: true,
  },
};

export const FreeStepsMixedContent: Story = {
  name: 'free steps — mixed content (resource/glory/discover/upgrade)',
  args: {
    size: 'md',
    track: freeTrack,
    validatedSteps: [1],
    currentResources: { gold: 3 },
    canActivate: true,
  },
};

export const FreeStepsNotOnBoard: Story = {
  name: 'free steps — card not on board (canActivate=false)',
  args: {
    size: 'md',
    track: freeTrack,
    validatedSteps: [],
    currentResources: { gold: 5 },
    canActivate: false,
  },
};

export const EmptySteps: Story = {
  name: 'empty step content (no cost, no onClick)',
  args: {
    size: 'md',
    track: emptyStep,
    validatedSteps: [],
    currentResources: {},
    canActivate: true,
  },
};
