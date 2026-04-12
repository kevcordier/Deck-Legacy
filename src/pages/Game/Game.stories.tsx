import { Game } from './Game';
import { GameProvider } from '@contexts/GameProvider';
import { GameUIProvider } from '@contexts/GameUIProvider';
import deckData from '@data/deck.json';
import { EMPTY_STATE } from '@engine/application/aggregates/GameAggregate';
import { createInstance } from '@engine/application/factory';
import type { GameState } from '@engine/domain/types';
import { loadCardDefs } from '@engine/infrastructure/loaders';
import type { Meta, StoryObj } from '@storybook/react-vite';

// ─── Debug wrapper ────────────────────────────────────────────────────────────
//
// Writes saveState + events to localStorage before mounting <Game />.
// The `key` changes on every args modification → full remount of the board.

type StoryArgs = {
  saveState: GameState;
};

function GameDebugWrapper() {
  return <Game />;
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
  const allInstances = deckEntries.map(entry =>
    createInstance(entry.id, entry.cardId, defs[entry.cardId].states[0].id, defs),
  );

  return Object.fromEntries(allInstances.map(inst => [inst.id, inst]));
};

const INSTANCES_BASE = getBaseInstances();

// Game in progress: 4 cards on the board, 6 in the draw pile
const PLAYING_STATE: GameState = {
  ...EMPTY_STATE,
  instances: INSTANCES_BASE,
  stickerStock: { 1: 2, 2: 1, 3: 0, 4: 3, 5: 1, 6: 0 },
  board: [1, 4, 7, 9],
  drawPile: [2, 5, 8, 10, 3, 6],
  discardPile: [],
  permanents: [],
  resources: { gold: 3, wood: 2 },
  round: 1,
  turn: 2,
};

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
  title: 'Pages/Game',
  component: GameDebugWrapper,
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
  },
  render: args => {
    return (
      <GameUIProvider>
        <GameProvider initialState={args.saveState}>
          <Game />
        </GameProvider>
      </GameUIProvider>
    );
  },
};

export default meta;
type Story = StoryObj<StoryArgs>;

// ─── Stories ──────────────────────────────────────────────────────────────────

export const Pregame: Story = {
  name: "Pregame (écran d'accueil)",
  args: {
    saveState: { ...EMPTY_STATE },
  },
};

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
      instances: {
        ...INSTANCES_BASE,
      },
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
      instances: {
        ...INSTANCES_BASE,
      },
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
      instances: {
        ...INSTANCES_BASE,
      },
      drawPile: [16, 14, 1, 13],
      board: [4, 7, 11],
    },
  },
};

export const WithOnDiscoverChooseStates: Story = {
  name: 'With ON_DISCOVER choose states',
  args: {
    saveState: {
      ...PLAYING_STATE,
      instances: {
        ...INSTANCES_BASE,
      },
      drawPile: [],
      discoveryPile: [13, 14],
      board: [],
    },
  },
};

export const WithStopCard: Story = {
  name: 'With ON_DISCOVER stop card',
  args: {
    saveState: {
      ...PLAYING_STATE,
      instances: {
        ...INSTANCES_BASE,
        11: { id: 11, cardId: 6, stateId: 4, stickers: {}, trackProgress: [] },
      },
      drawPile: [],
      discardPile: Array.from({ length: 22 }, (_, i) => i), // 22 cartes dans la défausse pour tester le stop à 23
      discoveryPile: [23, 24, 25, 26, 27],
      board: [],
    },
  },
};
