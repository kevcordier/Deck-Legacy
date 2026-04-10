import type { Meta, StoryObj } from '@storybook/react-vite';
import { PendingChoiceModal } from './PendingChoiceModal';
import type { CardDef, CardInstance } from '@engine/domain/types';
import { CardTag, PendingChoiceType, ActionType, Trigger } from '@engine/domain/enums';
import { GameProvider } from '@contexts/GameProvider';
import { EMPTY_STATE } from '@engine/application/aggregates/GameAggregate';

const meta: Meta<typeof PendingChoiceModal> = {
  title: 'Components/PendingChoiceModal',
  component: PendingChoiceModal,
  parameters: {
    layout: 'fullscreen',
  },
  argTypes: {
    resolvePlayerChoice: { action: 'resolvePlayerChoice' },
    resolvePayCost: { action: 'resolvePayCost' },
    onResolveTrigger: { action: 'resolveTrigger' },
    onSkipTrigger: { action: 'skipTrigger' },
  },
  render: args => (
    <GameProvider initialState={{ ...EMPTY_STATE }}>
      <PendingChoiceModal {...args} />
    </GameProvider>
  ),
};

export default meta;
type Story = StoryObj<typeof PendingChoiceModal>;

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
      tags: [CardTag.PERSON],
      productions: [{ gold: 1 }],
      cardEffects: [
        {
          label: 'Forger',
          actions: [],
          trigger: Trigger.END_OF_TURN,
          optional: true,
        },
      ],
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

const defs: Record<number, CardDef> = { 1: farmDef, 2: smithDef, 3: villageDef };

const instances: Record<number, CardInstance> = {
  1: { id: 1, cardId: 1, stateId: 1, stickers: {}, trackProgress: [] },
  2: { id: 2, cardId: 2, stateId: 1, stickers: {}, trackProgress: [] },
  3: { id: 3, cardId: 3, stateId: 1, stickers: {}, trackProgress: [] },
};

// --- Stories ---

export const ChooseCard: Story = {
  name: 'Choose card',
  args: {
    choice: {
      id: 'choice-1',
      type: PendingChoiceType.CHOOSE_CARD,
      kind: ActionType.DISCARD_CARD,
      sourceInstanceId: 99,
      pickCount: 1,
      choices: [1, 2, 3],
      isMandatory: false,
    },
    defs,
    instances,
  },
};

export const ChooseResource: Story = {
  name: 'Choose resource',
  args: {
    choice: {
      id: 'choice-2',
      type: PendingChoiceType.CHOOSE_RESOURCE,
      kind: ActionType.ADD_RESOURCES,
      sourceInstanceId: 1,
      pickCount: 1,
      choices: [{ gold: 2 }, { wood: 3 }, { stone: 2 }],
      isMandatory: true,
    },
    defs,
    instances,
  },
};

export const ChooseState: Story = {
  name: 'Choose state',
  args: {
    choice: {
      id: 'choice-3',
      type: PendingChoiceType.CHOOSE_STATE,
      kind: ActionType.CHOOSE_STATE,
      sourceInstanceId: 3,
      pickCount: 1,
      choices: [1, 2],
      isMandatory: true,
    },
    defs,
    instances,
  },
};

export const TriggerPileOptional: Story = {
  name: 'Trigger pile (optional)',
  args: {
    triggerPile: {
      'trigger-uuid-1': {
        sourceInstanceId: 2,
        effectDef: {
          label: 'Forger',
          actions: [],
          optional: true,
        },
      },
    },
    defs,
    instances,
  },
};

export const TriggerPileForced: Story = {
  name: 'Trigger pile (forced)',
  args: {
    triggerPile: {
      'trigger-uuid-2': {
        sourceInstanceId: 2,
        effectDef: {
          label: 'Forger',
          actions: [],
          optional: false,
        },
      },
    },
    defs,
    instances,
  },
};

export const TriggerPileMultiple: Story = {
  name: 'Trigger pile (multiple triggers)',
  args: {
    triggerPile: {
      'trigger-uuid-a': {
        sourceInstanceId: 1,
        effectDef: { label: 'Récolte', actions: [], optional: true },
      },
      'trigger-uuid-b': {
        sourceInstanceId: 2,
        effectDef: { label: 'Forger', actions: [], optional: false },
      },
    },
    defs,
    instances,
  },
};

export const NoChoice: Story = {
  name: 'No pending choice (renders nothing)',
  args: {
    defs,
    instances,
  },
};
