import { StoryProviders } from './StoryProviders';
import { baseInstances } from './storyCatalog';
import { DeckViewer } from '@components/DeckViewer/DeckViewer';
import { EMPTY_STATE } from '@deck-legacy/engine/domain/state/emptyState';
import type { Meta, StoryObj } from '@storybook/react-native';

const meta: Meta<typeof DeckViewer> = {
  title: 'Components/DeckViewer',
  component: DeckViewer,
  parameters: {
    layout: 'fullscreen',
  },
  decorators: [
    (Story, { parameters }) => {
      const { deck = [] } = parameters;
      const instances = Object.values(baseInstances()).filter(inst => deck.includes(inst.id));
      return (
        <StoryProviders initialState={{ ...EMPTY_STATE }}>
          <Story args={{ ...parameters, displayedCards: [instances[0]], deck: instances }} />
        </StoryProviders>
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

export const ThickPile: Story = {
  parameters: {
    title: 'Player Deck',
    deck: [2, 1, 3],
    stackCount: 20,
  },
};
