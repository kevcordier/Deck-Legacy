import { StoryProviders } from '../StoryProviders';
import { GameOverScreen } from '@components/ui/GameOverScreen/GameOverScreen';
import type { Meta, StoryObj } from '@storybook/react-native';

const meta: Meta<typeof GameOverScreen> = {
  title: 'UI/GameOverScreen',
  component: GameOverScreen,
  parameters: {
    layout: 'fullscreen',
  },
  decorators: [
    Story => (
      <StoryProviders>
        <Story />
      </StoryProviders>
    ),
  ],
  argTypes: {
    score: { control: { type: 'number', min: 0 } },
    onGoHome: { action: 'go home' },
  },
};

export default meta;
type Story = StoryObj<typeof GameOverScreen>;

export const Default: Story = {
  args: {
    score: 42,
  },
};
