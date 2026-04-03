import type { Meta, StoryObj } from '@storybook/react';
import { EventLog } from './EventLog';
import type { GameEvent } from '@engine/domain/types';
import { GameEventType } from '@engine/domain/enums';

const meta: Meta<typeof EventLog> = {
  title: 'Components/EventLog',
  component: EventLog,
  parameters: {
    layout: 'padded',
  },
};

export default meta;
type Story = StoryObj<typeof EventLog>;

const fullSession: GameEvent[] = [
  {
    id: '1',
    timestamp: Date.now(),
    type: GameEventType.GAME_STARTED,
    initialDeck: [1, 2, 3, 4, 5, 6, 7, 8],
  } as GameEvent,
  {
    id: '2',
    timestamp: Date.now(),
    type: GameEventType.ROUND_STARTED,
    round: 1,
    newCards: [],
  } as GameEvent,
  {
    id: '3',
    timestamp: Date.now(),
    type: GameEventType.TURN_STARTED,
    turn: 1,
    turnCards: [1, 2, 3],
  } as GameEvent,
  {
    id: '4',
    timestamp: Date.now(),
    type: GameEventType.CARD_PRODUCED,
    cardInstanceId: 1,
    productions: { wood: 2 },
  } as GameEvent,
  {
    id: '5',
    timestamp: Date.now(),
    type: GameEventType.CARD_PRODUCED,
    cardInstanceId: 2,
    productions: { gold: 1 },
  } as GameEvent,
  {
    id: '6',
    timestamp: Date.now(),
    type: GameEventType.USE_CARD_EFFECT,
    sourceInstanceId: 3,
    effectLabel: 'Forger',
    isDiscarded: false,
    isDestroyed: false,
    resolvedCost: { resources: { iron: 1 }, discardedCardIds: [], destroyedCardIds: [] },
  } as GameEvent,
  {
    id: '7',
    timestamp: Date.now(),
    type: GameEventType.PASS,
  } as GameEvent,
  {
    id: '8',
    timestamp: Date.now(),
    type: GameEventType.TURN_STARTED,
    turn: 2,
    turnCards: [4, 5],
  } as GameEvent,
  {
    id: '9',
    timestamp: Date.now(),
    type: GameEventType.CARD_PRODUCED,
    cardInstanceId: 4,
    productions: { stone: 3 },
  } as GameEvent,
  {
    id: '10',
    timestamp: Date.now(),
    type: GameEventType.UPGRADE_CARD,
    cardInstanceId: 5,
    stateId: 2,
    cost: { stone: 2 },
  } as GameEvent,
  {
    id: '11',
    timestamp: Date.now(),
    type: GameEventType.ADVANCE,
    turnCards: [6],
  } as GameEvent,
  {
    id: '12',
    timestamp: Date.now(),
    type: GameEventType.ROUND_STARTED,
    round: 2,
    newCards: [9, 10],
  } as GameEvent,
];

export const FullSession: Story = {
  name: 'Full session',
  args: {
    events: fullSession,
  },
};

export const Empty: Story = {
  args: {
    events: [],
  },
};

export const OnlyGameStart: Story = {
  name: 'Game just started',
  args: {
    events: [
      {
        id: '1',
        timestamp: Date.now(),
        type: GameEventType.GAME_STARTED,
        initialDeck: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
      } as GameEvent,
    ],
  },
};

export const WithDiscoveries: Story = {
  name: 'Round with discoveries',
  args: {
    events: [
      {
        id: '1',
        timestamp: Date.now(),
        type: GameEventType.GAME_STARTED,
        initialDeck: [1, 2, 3],
      } as GameEvent,
      {
        id: '2',
        timestamp: Date.now(),
        type: GameEventType.ROUND_STARTED,
        round: 2,
        newCards: [11, 12, 13],
      } as GameEvent,
      {
        id: '3',
        timestamp: Date.now(),
        type: GameEventType.TURN_STARTED,
        turn: 1,
        turnCards: [1],
      } as GameEvent,
      {
        id: '4',
        timestamp: Date.now(),
        type: GameEventType.USE_CARD_EFFECT,
        sourceInstanceId: 1,
        effectLabel: 'Effet passif',
        isDiscarded: true,
        isDestroyed: false,
        resolvedCost: { resources: {}, discardedCardIds: [], destroyedCardIds: [] },
      } as GameEvent,
    ],
  },
};
