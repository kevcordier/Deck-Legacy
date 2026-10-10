import { StoryProviders } from './StoryProviders';
import { GameHeader } from '@components/GameHeader/GameHeader';
import { EMPTY_STATE } from '@deck-legacy/engine/application/emptyState';
import type { Meta, StoryObj } from '@storybook/react-native';

type GameHeaderProps = {
  round?: number;
  turn?: number;
  drawPile?: number[];
};

const meta: Meta<GameHeaderProps> = {
  title: 'Components/GameHeader',
  component: GameHeader,
  render: ({ round = 0, turn = 0, drawPile = [], ...props }) => {
    return (
      <StoryProviders
        key={JSON.stringify({ round, turn, drawPile })}
        initialState={{ ...EMPTY_STATE, round, turn, drawPile }}
      >
        <GameHeader {...props} />
      </StoryProviders>
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
