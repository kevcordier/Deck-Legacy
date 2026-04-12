import { Header } from './Header';
import { GameProvider } from '@contexts/GameProvider';
import { GameUIProvider } from '@contexts/GameUIProvider';
import { EMPTY_STATE } from '@engine/application/aggregates/GameAggregate';
import type { Meta, StoryObj } from '@storybook/react-vite';

type HeaderProps = {
  round?: number;
  turn?: number;
  drawPile?: number[];
};

const meta: Meta<HeaderProps> = {
  title: 'Components/Header',
  component: Header,
  render: ({ round = 0, turn = 0, drawPile = [], ...props }) => {
    return (
      <GameUIProvider>
        <GameProvider
          key={JSON.stringify({ round, turn, drawPile })}
          initialState={{ ...EMPTY_STATE, round, turn, drawPile }}
        >
          <Header {...props} />
        </GameProvider>
      </GameUIProvider>
    );
  },
};

export default meta;

type Story = StoryObj<typeof meta>;

export const Pregame: Story = {};

export const Playing: Story = {
  args: {
    round: 2,
    drawPile: [1, 2, 3],
    turn: 1,
  },
};
