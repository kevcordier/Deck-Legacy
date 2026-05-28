import { GameOverScreen } from '@components/ui/GameOverScreen/GameOverScreen';
import type { Meta, StoryObj } from '@storybook/react-vite';

const meta: Meta<typeof GameOverScreen> = {
  title: 'UI/GameOverScreen',
  component: GameOverScreen,
  parameters: {
    layout: 'fullscreen',
  },
  argTypes: {
    score: { control: { type: 'number', min: 0 } },
    onStartNewGame: { action: 'start new game' },
  },
};

export default meta;
type Story = StoryObj<typeof GameOverScreen>;

export const Default: Story = {
  args: {
    score: 42,
  },
};
