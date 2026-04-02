import type { Meta, StoryObj } from '@storybook/react';
import { ResourceBar } from './ResourceBar';

const meta: Meta<typeof ResourceBar> = {
  title: 'Components/ResourceBar',
  component: ResourceBar,
  parameters: {
    layout: 'padded',
  },
  argTypes: {
    round: { control: 'number' },
    turn: { control: 'number' },
    score: { control: 'number' },
    deckSize: { control: 'number' },
    discardSize: { control: 'number' },
  },
};

export default meta;
type Story = StoryObj<typeof ResourceBar>;

export const Default: Story = {
  args: {
    resources: { gold: 3, wood: 2, stone: 1 },
    score: 12,
    round: 2,
    turn: 4,
    deckSize: 8,
    discardSize: 3,
  },
};

export const NoResources: Story = {
  args: {
    resources: {},
    score: 0,
    round: 1,
    turn: 1,
    deckSize: 12,
    discardSize: 0,
  },
};

export const RichResources: Story = {
  args: {
    resources: { gold: 5, wood: 3, stone: 2, iron: 1, sword: 2, goods: 4 },
    score: 45,
    round: 5,
    turn: 8,
    deckSize: 4,
    discardSize: 10,
  },
};

export const GameStart: Story = {
  args: {
    resources: {},
    score: 0,
    round: 0,
    turn: 0,
    deckSize: 15,
    discardSize: 0,
  },
};
