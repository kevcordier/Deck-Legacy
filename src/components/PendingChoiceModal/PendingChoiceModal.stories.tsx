import type { Meta, StoryObj } from '@storybook/react';
import type { CardDef, CardInstance } from '@engine/types';
import { PendingChoiceModal } from './PendingChoiceModal';

const meta: Meta<typeof PendingChoiceModal> = {
  title: 'game/PendingChoiceModal',
  component: PendingChoiceModal,
  parameters: { layout: 'fullscreen' },
  args: {
    instances: {},
    currentResources: { gold: 2 },
    activated: [],
    onDiscoverCard: () => {},
    onChooseUpgrade: () => {},
    onPlayFromDiscard: () => {},
    onChooseResource: () => {},
    onChooseState: () => {},
    onCopyProduction: () => {},
    onBlockCard: () => {},
    onDiscardForCost: () => {},
    onCancelDiscardCost: () => {},
  },
};

export default meta;
type Story = StoryObj<typeof PendingChoiceModal>;

// --- Shared defs ---

const defs: Record<number, CardDef> = {
  10: {
    id: 10,
    name: 'Plains',
    states: [
      { id: 1, name: 'Plains', tags: ['Land'], productions: [{ gold: 2 }] },
      { id: 2, name: 'Farmlands', tags: ['Land'], productions: [{ gold: 3 }], glory: 1 },
    ],
  },
  11: {
    id: 11,
    name: 'Forest',
    states: [{ id: 1, name: 'Forest', tags: ['Land'], productions: [{ wood: 2 }] }],
  },
  12: {
    id: 12,
    name: 'Sawmill',
    states: [
      { id: 1, name: 'Sawmill', tags: ['Building'], productions: [{ wood: 2 }] },
      { id: 2, name: 'Advanced Sawmill', tags: ['Building'], productions: [{ wood: 3 }], glory: 1 },
    ],
  },
};

function makeInst(uid: string, cardId: number, stateId: number): CardInstance {
  return { uid, cardId, stateId, deckEntryId: cardId, stickers: [], blockedBy: null, trackProgress: null, tags: [] };
}

const instances: Record<string, CardInstance> = {
  'i10': makeInst('i10', 10, 1),
  'i11': makeInst('i11', 11, 1),
  'i12': makeInst('i12', 12, 1),
};

// --- Stories ---

export const DiscoverCard: Story = {
  args: {
    defs,
    choice: {
      kind: 'discover_card',
      actionCardUid: 'i10',
      actionLabel: 'Discover a region.',
      candidates: [10, 11, 12],
      pickCount: 1,
    },
  },
};

export const ChooseState: Story = {
  args: {
    defs,
    choice: {
      kind: 'choose_state',
      instance: makeInst('new1', 10, 1),
      addedTo: 'deck_top',
      options: defs[10].states,
    },
  },
};

export const ChooseResource: Story = {
  args: {
    defs,
    choice: {
      kind: 'choose_resource',
      source: 'activation',
      cardUid: 'i10',
      options: [{ gold: 1 }, { wood: 1 }, { stone: 1 }],
    },
  },
};

export const ChooseResourceFromAction: Story = {
  args: {
    defs,
    choice: {
      kind: 'choose_resource',
      source: 'action',
      cardUid: 'i12',
      options: [{ wood: 1 }, { stone: 1 }],
    },
  },
};

export const ChooseUpgrade: Story = {
  args: {
    defs,
    instances,
    choice: {
      kind: 'choose_upgrade',
      cardUid: 'i12',
      options: [
        { cost: { resources: [{ gold: 2 }] }, upgradeTo: 2 },
      ],
    },
  },
};

export const PlayFromDiscard: Story = {
  args: {
    defs,
    instances,
    choice: {
      kind: 'play_from_discard',
      actionCardUid: 'i10',
      candidates: ['i11', 'i12'],
      pickCount: 1,
    },
  },
};

export const BlockCard: Story = {
  args: {
    defs,
    instances,
    choice: {
      kind: 'block_card',
      blockerUid: 'i10',
      candidates: ['i11', 'i12'],
      actionLabel: 'Blocks a card with gold productions.',
    },
  },
};

export const DiscardForCost: Story = {
  args: {
    defs,
    instances,
    choice: {
      kind: 'discard_for_cost',
      actionCardUid: 'i10',
      actionId: 'a0',
      candidates: ['i11', 'i12'],
      remainingScopes: [],
      collectedUids: [],
    },
  },
};
