import type { Meta, StoryObj } from '@storybook/react-vite';
import { ResourceBar } from './ResourceBar';
import { GameProvider } from '@contexts/GameProvider';
import { EMPTY_STATE } from '@engine/application/aggregates/GameAggregate';
import type { CardInstance } from '@engine/domain/types';

type ResourceBarProps = {
  instances: CardInstance[];
  resources: Record<string, number>;
  round: number;
  turn: number;
  drawPile: number[];
  discardPile: number[];
};

const meta: Meta<ResourceBarProps> = {
  title: 'Components/ResourceBar',
  component: ResourceBar,
  parameters: {
    layout: 'padded',
  },
  argTypes: {
    round: { control: 'number' },
    turn: { control: 'number' },
    drawPile: { control: 'object' },
    discardPile: { control: 'object' },
  },
  render: ({ round, turn, drawPile, discardPile, resources, instances }) => {
    return (
      <GameProvider
        key={JSON.stringify({ round, turn, drawPile, discardPile, resources, instances })}
        initialState={{
          ...EMPTY_STATE,
          resources,
          round,
          turn,
          drawPile,
          discardPile,
        }}
      >
        <ResourceBar />
      </GameProvider>
    );
  },
};

export default meta;
type Story = StoryObj<typeof ResourceBar>;

export const Default: Story = {
  args: {
    instances: [
      {
        id: 1,
        cardId: 9,
        stateId: 1,
      },
    ],
    resources: { gold: 3, wood: 2, stone: 1 },
    round: 2,
    turn: 4,
    drawPile: [1, 2, 3, 4, 5],
    discardPile: [6, 7, 8],
  },
};

export const NoResources: Story = {
  args: {
    resources: {},
    round: 1,
    turn: 1,
    drawPile: Array(12).fill(0),
    discardPile: Array(0).fill(0),
  },
};

export const RichResources: Story = {
  args: {
    resources: { gold: 5, wood: 3, stone: 2, iron: 1, weapon: 2, goods: 4 },
    round: 5,
    turn: 8,
    drawPile: Array(4).fill(0),
    discardPile: Array(10).fill(0),
  },
};

export const GameStart: Story = {
  args: {
    resources: {},
    score: 0,
    round: 0,
    turn: 0,
    drawPile: Array(15).fill(0),
    discardPile: Array(0).fill(0),
  },
};
