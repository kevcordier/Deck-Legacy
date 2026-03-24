import type { Meta, StoryObj } from '@storybook/react';
import { GameOverScreen } from './GameOverScreen';

const meta: Meta<typeof GameOverScreen> = {
  title: 'game/GameOverScreen',
  component: GameOverScreen,
  parameters: { layout: 'fullscreen' },
  args: { onNewGame: () => {} },
};

export default meta;
type Story = StoryObj<typeof GameOverScreen>;

export const Default: Story = {
  args: { score: 24, round: 5 },
};

export const LowScore: Story = {
  args: { score: 3, round: 2 },
};

export const HighScore: Story = {
  args: { score: 87, round: 12 },
};

export const ZeroScore: Story = {
  args: { score: 0, round: 1 },
};
