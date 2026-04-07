import type { Meta, StoryObj } from '@storybook/react-vite';
import { DeckViewer } from './DeckViewer';
import { EMPTY_STATE } from '@engine/application/aggregates/GameAggregate';
import deckData from '@data/deck.json';
import { createInstance } from '@engine/application/factory';
import { loadCardDefs } from '@engine/infrastructure/loaders';
import { GameProvider } from '@contexts/GameProvider';

const meta: Meta<typeof DeckViewer> = {
  title: 'Components/DeckViewer',
  component: DeckViewer,
  parameters: {
    layout: 'fullscreen',
  },
  decorators: [
    (Story, { parameters }) => {
      const { deck = [] } = parameters;
      const instances = deckData.deck
        .map(entry => createInstance(entry.id, entry.cardId, 1, loadCardDefs()))
        .filter(inst => deck.includes(inst.id));
      return (
        <GameProvider initialState={{ ...EMPTY_STATE }}>
          <Story args={{ ...parameters, displayedCard: instances[0], deck: instances }} />
        </GameProvider>
      );
    },
  ],
  argTypes: {
    title: { control: 'text' },
    emptyText: { control: 'text' },
    deck: { control: 'object' },
  },
};

export default meta;
type Story = StoryObj<typeof DeckViewer>;

export const Default: Story = {
  parameters: {
    title: 'Player Deck',
    deck: [2, 1, 3],
  },
};

export const SingleCard: Story = {
  parameters: {
    title: 'Player Deck',
    deck: [1],
  },
};

export const Empty: Story = {
  parameters: {
    title: 'Player Deck',
    deck: [],
    emptyText: 'No cards in deck',
  },
};
