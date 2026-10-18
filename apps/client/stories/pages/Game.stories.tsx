import { baseInstances, makeInstance } from '../storyCatalog';
import { GameProvider } from '@contexts/GameProvider';
import { GameUIProvider } from '@contexts/GameUIProvider';
import { EMPTY_STATE } from '@deck-legacy/engine/domain/emptyState';
import { Phase } from '@deck-legacy/engine/domain/enums';
import type { GameState } from '@deck-legacy/engine/domain/types';
import { Game } from '@pages/Game/Game';
import type { Meta, StoryObj } from '@storybook/react-native';

// ─── Debug wrapper ────────────────────────────────────────────────────────────
//
// Renders <Game /> from a static state (no server calls).
// The `key` changes on every args modification → full remount of the board.

type StoryArgs = {
  /** Game state; base deck instances are added automatically, `instances` overrides them. */
  saveState: GameState;
  /** Instance id → state id, applied on top of the base deck instances. */
  stateOverrides?: Record<number, number>;
};

function GameDebugWrapper() {
  return <Game />;
}

// ─── Preset fixtures ──────────────────────────────────────────────────────────
//
// instanceIds follow deck.json (id 1-10 = starting deck).
// cardId 1 = Wild Grass · cardId 2 = 2nd card · cardId 3 = 3rd card …
// Adjust cardId/stateId according to the cards you want to test.

// Game in progress: 4 cards on the board, 6 in the draw pile
const PLAYING_STATE: GameState = {
  ...EMPTY_STATE,
  instances: {},
  stickerStock: { 1: 2, 2: 1, 3: 0, 4: 3, 5: 1, 6: 0 },
  board: [1, 4, 7, 9],
  drawPile: [2, 5, 8, 10, 3, 6],
  discardPile: [],
  permanents: [],
  resources: { gold: 3, wood: 2 },
  round: 1,
  turn: 2,
  phase: Phase.PLAYING,
};

// End of round: all cards discarded, draw pile empty
const PREROUND_STATE: GameState = {
  ...PLAYING_STATE,
  board: [],
  drawPile: [],
  discardPile: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
  permanents: [],
  resources: { gold: 8, wood: 4, stone: 2 },
  round: 2,
  turn: 0,
  phase: Phase.ROUND_START,
};

// Abundant resources for testing expensive actions
const RICH_STATE: GameState = {
  ...PLAYING_STATE,
  resources: { gold: 10, wood: 10, stone: 10, iron: 10, weapon: 10, goods: 10 },
};

// Permanent card on the board
const PERMANENT_STATE: GameState = {
  ...PLAYING_STATE,
  permanents: [25, 26, 27],
  board: [1, 4, 7],
};

// ─── Meta ─────────────────────────────────────────────────────────────────────

const meta: Meta<StoryArgs> = {
  title: 'Pages/Game',
  component: GameDebugWrapper,
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component:
          "Story de debug : modifiez `saveState` et `events` dans les contrôles pour tester n'importe quel état du jeu. L'état est rendu en lecture seule, sans appel au serveur.",
      },
    },
  },
  argTypes: {
    saveState: {
      control: 'object',
      description: 'Snapshot GameState injecté comme point de sauvegarde',
    },
  },
  render: ({ saveState, stateOverrides = {} }) => {
    const instances = { ...baseInstances(), ...saveState.instances };
    for (const [id, stateId] of Object.entries(stateOverrides)) {
      instances[Number(id)] = { ...instances[Number(id)], stateId };
    }
    return (
      <GameUIProvider>
        <GameProvider initialState={{ ...saveState, instances }}>
          <Game />
        </GameProvider>
      </GameUIProvider>
    );
  },
};

export default meta;
type Story = StoryObj<StoryArgs>;

// ─── Stories ──────────────────────────────────────────────────────────────────

export const Playing: Story = {
  name: 'Playing (tour en cours)',
  args: {
    saveState: PLAYING_STATE,
  },
};

export const PreRound: Story = {
  name: 'Pre-round (fin de manche)',
  args: {
    saveState: PREROUND_STATE,
  },
};

export const RichResources: Story = {
  name: 'Rich resources (toutes les ressources)',
  args: {
    saveState: RICH_STATE,
  },
};

export const WithPermanent: Story = {
  name: 'With permanent card',
  args: {
    saveState: PERMANENT_STATE,
  },
};

export const With1OnPlayTriggerPile: Story = {
  name: 'With 1 ON_PLAY Bandit',
  args: {
    saveState: {
      ...PLAYING_STATE,
      instances: {},
      drawPile: [16, 2, 3, 5],
      board: [1, 4, 7, 12, 13],
    },
  },
};

export const With2Bandits: Story = {
  name: 'With 2 ON_PLAY Bandits in deck',
  args: {
    saveState: {
      ...PLAYING_STATE,
      instances: {},
      drawPile: [16, 14, 3, 2],
      board: [1, 4, 7, 11, 13],
    },
  },
};

export const With2BanditsAndOneAvailableCard: Story = {
  name: 'With 2 ON_PLAY Bandits and one available card',
  args: {
    saveState: {
      ...PLAYING_STATE,
      instances: {},
      drawPile: [16, 14, 1, 13],
      board: [4, 7, 11],
    },
  },
};

// Cathedral (Hill state 4) + 3 person cards on board
// Expected: Cathedral shows 4 gold production (1 base + 3 from persons)
const CATHEDRAL_STATE: GameState = {
  ...PLAYING_STATE,
  instances: {
    // Instance 17 (Hill card) upgraded to Cathedral state
    17: makeInstance({ id: 17, cardId: 11, stateId: 4 }),
    // Instance 12 (River card) upgraded to Explorers state (PERSON)
    12: makeInstance({ id: 12, cardId: 7, stateId: 4 }),
  },
  // board: Cathedral + Trader (PERSON) + Explorers (PERSON) + Field Worker (PERSON)
  board: [17, 10, 12, 13],
  drawPile: [1, 2, 3, 4, 5, 6],
  discardPile: [],
  permanents: [],
  resources: { gold: 3 },
  round: 2,
  turn: 1,
};

export const CathedralAdjustProduction: Story = {
  name: 'Cathedral — ADJUST_production (3 personnes → +3 or)',
  args: {
    saveState: CATHEDRAL_STATE,
  },
};

export const WithEndTurnTrigger: Story = {
  name: 'With end turn trigger',
  args: {
    saveState: {
      ...PLAYING_STATE,
      instances: {},
      drawPile: [1, 2, 3],
      board: [4, 7, 82],
    },
    stateOverrides: { 82: 3 },
  },
};

export const CardDestroyed: Story = {
  name: 'With action destroying a card on board',
  args: {
    saveState: {
      ...PLAYING_STATE,
      instances: {
        6: makeInstance({ id: 6, cardId: 2, stateId: 4 }),
      },
      drawPile: [1, 2, 3],
      board: [4, 7, 6],
    },
  },
};
