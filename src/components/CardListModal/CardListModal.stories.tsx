import { CardListModal } from './CardListModal';
import { GameProvider } from '@contexts/GameProvider';
import { EMPTY_STATE } from '@engine/application/aggregates/GameAggregate';
import type { CardInstance } from '@engine/domain/types';
import type { Meta, StoryObj } from '@storybook/react-vite';

const meta: Meta<typeof CardListModal> = {
  title: 'Components/CardListModal',
  component: CardListModal,
  parameters: {
    layout: 'fullscreen',
  },
  argTypes: {
    onClose: { action: 'closed' },
  },
  render: args => (
    <GameProvider initialState={{ ...EMPTY_STATE }}>
      <CardListModal {...args} />
    </GameProvider>
  ),
};

export default meta;
type Story = StoryObj<typeof CardListModal>;

// --- Shared mock data ---

const instances: CardInstance[] = [
  { id: 1, cardId: 1, stateId: 1, stickers: {}, trackProgress: [], cumulated: 0 },
  { id: 2, cardId: 2, stateId: 1, stickers: {}, trackProgress: [], cumulated: 0 },
  { id: 3, cardId: 3, stateId: 1, stickers: {}, trackProgress: [], cumulated: 0 },
];

export const WithCards: Story = {
  args: {
    title: 'Pile de défausse',
    subtitle: '3 cartes',
    cards: instances,
  },
};

export const Empty: Story = {
  args: {
    title: 'Pile de défausse',
    cards: [],
  },
};

export const EmptyWithCustomText: Story = {
  args: {
    title: 'Pioche',
    cards: [],
    emptyText: 'La pioche est vide.',
  },
};

export const SingleCard: Story = {
  args: {
    title: 'Découverte',
    cards: [instances[0]],
  },
};
