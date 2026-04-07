import type { Meta, StoryObj } from '@storybook/react-vite';

import { Header } from './Header';
import { GameProvider } from '@contexts/GameProvider';
import { GameUIProvider } from '@contexts/GameUIProvider';
import { EMPTY_STATE } from '@engine/application/aggregates/GameAggregate';

const meta: Meta<typeof Header> = {
  title: 'Containers/Header',
  component: Header,
  decorators: [
    (Story, { parameters }) => {
      const { round = 0, turn = 0, drawPile = [] } = parameters;
      return (
        <GameUIProvider>
          <GameProvider initialState={{ ...EMPTY_STATE, round, turn, drawPile }}>
            <Story />
          </GameProvider>
        </GameUIProvider>
      );
    },
  ],
};

export default meta;

type Story = StoryObj<typeof meta>;

export const Pregame: Story = {};

export const Preround: Story = {
  parameters: {
    round: 1,
    drawPile: [1, 2, 3],
    turn: 0,
  },
};

export const RoundPreview: Story = {
  parameters: {
    round: 2,
    drawPile: [1, 2, 3],
  },
};

export const Playing: Story = {
  parameters: {
    round: 2,
    drawPile: [1, 2, 3],
    turn: 1,
  },
};
