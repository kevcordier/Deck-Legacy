import type { Meta, StoryObj } from '@storybook/react';
import type { GameEvent } from '@engine/types';
import { EventLog } from './EventLog';

const meta: Meta<typeof EventLog> = {
  title: 'game/EventLog',
  component: EventLog,
  parameters: { layout: 'centered' },
  decorators: [
    Story => (
      <div style={{ width: 360, height: 480, display: 'flex', flexDirection: 'column' }}>
        <Story />
      </div>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof EventLog>;

const events: GameEvent[] = [
  {
    type: 'GAME_STARTED',
    payload: { initialInstances: [], discoveryInstances: [], stickerStock: {} },
  },
  {
    type: 'ROUND_STARTED',
    payload: { round: 1, addedCards: [], permanentUids: [], deckUids: ['c1', 'c2', 'c3'] },
  },
  {
    type: 'TURN_STARTED',
    payload: { turn: 1, drawnUids: ['c1'], remainingDeck: ['c2', 'c3'] },
  },
  {
    type: 'CARD_ACTIVATED',
    payload: { cardUid: 'c1', resourcesGained: { gold: 2 } },
  },
  {
    type: 'ACTION_RESOLVED',
    payload: {
      activatedUids: [],
      actionCardUid: 'c1',
      actionId: 'a0',
      cost: { resources: [{ gold: 1 }] },
      discardedUids: [],
      endsTurn: false,
      resourcesGained: { wood: 1 },
    },
  },
  {
    type: 'UPGRADE_RESOLVED',
    payload: {
      activatedUids: [],
      cardUid: 'c2',
      fromStateId: 1,
      toStateId: 2,
      cost: { resources: [{ gold: 3 }] },
      discardedUids: ['c2'],
    },
  },
  {
    type: 'CARD_DISCOVERED',
    payload: { instance: { uid: 'new1', cardId: 5, stateId: 1, stickers: [], blockedBy: null, trackProgress: null, tags: [] }, addedTo: 'deck_top' },
  },
  {
    type: 'CARD_BLOCKED',
    payload: { blockerUid: 'c3', targetUid: 'c4' },
  },
  {
    type: 'CARD_DESTROYED',
    payload: { cardUid: 'c3', fromZone: 'tableau' },
  },
  {
    type: 'TURN_ENDED',
    payload: { reason: 'voluntary', discardedUids: ['c1'], persistedUids: [] },
  },
  {
    type: 'ROUND_STARTED',
    payload: { round: 2, addedCards: [], permanentUids: [], deckUids: [] },
  },
  {
    type: 'TURN_STARTED',
    payload: { turn: 2, drawnUids: ['c2'], remainingDeck: [] },
  },
  {
    type: 'CARD_ACTIVATED',
    payload: { cardUid: 'c2', resourcesGained: { wood: 3 } },
  },
  {
    type: 'STICKER_ADDED',
    payload: { cardUid: 'c2', sticker: { stickerNumber: 3, effect: { type: 'resource', resource: 'gold', amount: 1 } } },
  },
  {
    type: 'TURN_ENDED',
    payload: { reason: 'action', discardedUids: ['c2'], persistedUids: [] },
  },
];

export const Default: Story = {
  args: { events },
};

export const Short: Story = {
  args: { events: events.slice(0, 4) },
};

export const Empty: Story = {
  args: { events: [] },
};
