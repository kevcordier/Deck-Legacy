import type { Meta, StoryObj } from '@storybook/react';
import { useEffect, useState } from 'react';
import { GameBoard } from './GameBoard';
import { EMPTY_STATE } from '@engine/application/aggregates/GameAggregate';
import type { GameState, GameEvent, TriggerEntry } from '@engine/domain/types';
import {
  ActionType,
  CardTag,
  GameEventType,
  ResourceType,
  TargetScope,
  Trigger,
} from '@engine/domain/enums';
import { createInstance } from '@engine/application/factory';
import deckData from '@data/deck.json';
import { loadCardDefs } from '@engine/infrastructure/loaders';

// ─── Debug wrapper ────────────────────────────────────────────────────────────
//
// Writes saveState + events to localStorage before mounting <GameBoard />.
// The `key` changes on every args modification → full remount of the board.

type StoryArgs = {
  saveState: GameState;
  events: GameEvent[];
};

function writeSave(saveState: GameState, events: GameEvent[]) {
  localStorage.setItem(
    'deck_legacy_save',
    JSON.stringify({ events, saveState, savedAt: 0, round: saveState.round, turn: saveState.turn }),
  );
}

function GameBoardDebugWrapper({ saveState, events }: StoryArgs) {
  // useState initializer: writes to localStorage before the first mount of GameBoard
  const [mountKey, setMountKey] = useState(() => {
    const key = JSON.stringify({ saveState, events });
    writeSave(saveState, events);
    return key;
  });

  // When args change: 1) write the new state, 2) change the key → remount GameBoard
  useEffect(() => {
    const key = JSON.stringify({ saveState, events });
    writeSave(saveState, events);
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMountKey(key);
  }, [saveState, events]);

  return <GameBoard key={mountKey} />;
}

// ─── Preset fixtures ──────────────────────────────────────────────────────────
//
// instanceIds follow deck.json (id 1-10 = starting deck).
// cardId 1 = Wild Grass · cardId 2 = 2nd card · cardId 3 = 3rd card …
// Adjust cardId/stateId according to the cards you want to test.

const getDefs = () => {
  return loadCardDefs();
};

const getBaseInstances = () => {
  const deckEntries = (deckData.deck as { id: number; cardId: number }[]).sort(
    (a, b) => a.id - b.id,
  );

  const defs = getDefs();

  return deckEntries.map(entry =>
    createInstance(entry.id, entry.cardId, defs[entry.cardId].states[0].id, defs),
  );
};

const INSTANCES_BASE = getBaseInstances();

// Game in progress: 4 cards on the board, 6 in the draw pile
const PLAYING_STATE: GameState = {
  ...EMPTY_STATE,
  instances: INSTANCES_BASE,
  board: [1, 4, 7, 9],
  drawPile: [2, 5, 8, 10, 3, 6],
  discardPile: [],
  permanents: [],
  resources: { gold: 3, wood: 2 },
  round: 1,
  turn: 2,
};

const PLAYING_EVENTS: GameEvent[] = [
  {
    id: 'evt-1',
    timestamp: Date.now() - 5000,
    type: GameEventType.TURN_STARTED,
    turn: 2,
    turnCards: [1, 4, 7, 9],
    onPlayEvents: [],
  } as GameEvent,
];

// End of round: all cards discarded, draw pile empty
const PREROUND_STATE: GameState = {
  ...EMPTY_STATE,
  instances: INSTANCES_BASE,
  board: [],
  drawPile: [],
  discardPile: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
  permanents: [],
  resources: { gold: 8, wood: 4, stone: 2 },
  round: 1,
  turn: 0,
};

// Abundant resources for testing expensive actions
const RICH_STATE: GameState = {
  ...PLAYING_STATE,
  resources: { gold: 10, wood: 10, stone: 10, iron: 10, weapon: 10, goods: 10 },
};

// Permanent card on the board
const PERMANENT_STATE: GameState = {
  ...PLAYING_STATE,
  permanents: [10],
  board: [1, 4, 7],
  instances: {
    ...INSTANCES_BASE,
    10: { id: 10, cardId: 5, stateId: 1, stickers: {}, trackProgress: [] },
  },
};

// ─── Meta ─────────────────────────────────────────────────────────────────────

const meta: Meta<StoryArgs> = {
  title: 'Pages/GameBoard',
  component: GameBoardDebugWrapper,
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component:
          "Story de debug : modifiez `saveState` et `events` dans les contrôles pour tester n'importe quel état du jeu. Les valeurs sont injectées dans `localStorage` (clé `deck_legacy_save`) avant chaque rendu.",
      },
    },
  },
  argTypes: {
    saveState: {
      control: 'object',
      description: 'Snapshot GameState injecté comme point de sauvegarde',
    },
    events: {
      control: 'object',
      description: 'GameEvent[] rejoués par-dessus saveState (depuis le dernier save point)',
    },
  },
};

export default meta;
type Story = StoryObj<StoryArgs>;

// ─── Stories ──────────────────────────────────────────────────────────────────

export const Pregame: Story = {
  name: "Pregame (écran d'accueil)",
  args: {
    saveState: { ...EMPTY_STATE },
    events: [],
  },
};

export const Playing: Story = {
  name: 'Playing (tour en cours)',
  args: {
    saveState: PLAYING_STATE,
    events: PLAYING_EVENTS,
  },
};

export const PreRound: Story = {
  name: 'Pre-round (fin de manche)',
  args: {
    saveState: PREROUND_STATE,
    events: [],
  },
};

export const RichResources: Story = {
  name: 'Rich resources (toutes les ressources)',
  args: {
    saveState: RICH_STATE,
    events: PLAYING_EVENTS,
  },
};

export const WithPermanent: Story = {
  name: 'With permanent card',
  args: {
    saveState: PERMANENT_STATE,
    events: [],
  },
};

// ─── Trigger pile preset ──────────────────────────────────────────────────────
//
// 2 Bandits (cardId 9 & 10, instances 14 & 16) → ON_PLAY : BLOCK_CARD
// 1 Stop    (cardId 15,      instance  23)      → ON_DISCOVER : DISCOVER_CARD
//
// ≥ 2 triggers → useGame n'auto-résout pas et ouvre la PendingChoiceModal.

const BANDIT_EFFECT: TriggerEntry['effectDef'] = {
  label: 'When played, blocks 1 card with gold productions.',
  trigger: Trigger.ON_PLAY,
  optional: false,
  actions: [
    {
      id: 1,
      type: ActionType.BLOCK_CARD,
      cards: {
        scope: TargetScope.BOARD,
        tags: [CardTag.LAND],
        produces: [ResourceType.GOLD],
      },
    },
  ],
};

const STOP_EFFECT: TriggerEntry['effectDef'] = {
  label: 'Stop',
  description:
    'Now that you have got the hang of the game, you may reset to start again if you like to give it your best shot.',
  trigger: Trigger.ON_DISCOVER,
  actions: [
    { id: 1, type: ActionType.DISCOVER_CARD, cards: { ids: [24] } },
    { id: 2, type: ActionType.DISCOVER_CARD, cards: { ids: [25] } },
    { id: 3, type: ActionType.DISCOVER_CARD, cards: { ids: [26] } },
    { id: 4, type: ActionType.DISCOVER_CARD, cards: { ids: [27] } },
  ],
};

const TRIGGER_PILE: Record<string, TriggerEntry> = {
  'trigger-bandit-14': { effectDef: BANDIT_EFFECT, sourceInstanceId: 14 },
  'trigger-bandit-16': { effectDef: BANDIT_EFFECT, sourceInstanceId: 16 },
  'trigger-stop-23': { effectDef: STOP_EFFECT, sourceInstanceId: 23 },
};

const TRIGGER_STATE: GameState = {
  ...PLAYING_STATE,
  instances: {
    ...INSTANCES_BASE,
  },
  board: [1, 4, 7, 14, 16],
  triggerPile: TRIGGER_PILE,
};

export const With2OnPlayTriggerPile: Story = {
  name: 'With 2 ON_PLAY Bandits',
  args: {
    saveState: TRIGGER_STATE,
    events: [],
  },
};

export const WithOnDiscoverTriggerPile: Story = {
  name: 'With ON_DISCOVER Stop',
  args: {
    saveState: TRIGGER_STATE,
    events: [],
  },
};
