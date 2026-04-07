import type { Meta, StoryObj } from '@storybook/react-vite';
import { GameOverScreen } from './GameOverScreen';

const meta: Meta<typeof GameOverScreen> = {
  title: 'Components/GameOverScreen',
  component: GameOverScreen,
  parameters: {
    layout: 'fullscreen',
  },
  argTypes: {
    score: { control: { type: 'number', min: 0 } },
    round: { control: { type: 'number', min: 1 } },
    onNewGame: { action: 'newGame' },
  },
};

export default meta;
type Story = StoryObj<typeof GameOverScreen>;

export const Default: Story = {
  args: {
    score: 42,
    round: 8,
  },
};

export const LowScore: Story = {
  args: {
    score: 5,
    round: 3,
  },
};

export const HighScore: Story = {
  args: {
    score: 150,
    round: 20,
  },
};

export const ZeroScore: Story = {
  args: {
    score: 0,
    round: 1,
  },
};
