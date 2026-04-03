import type { Meta, StoryObj } from '@storybook/react';
import { RulesModal } from './RulesModal';

const meta: Meta<typeof RulesModal> = {
  title: 'Components/RulesModal',
  component: RulesModal,
  parameters: {
    layout: 'fullscreen',
  },
  argTypes: {
    onClose: { action: 'closed' },
  },
};

export default meta;
type Story = StoryObj<typeof RulesModal>;

export const Default: Story = {
  args: {},
};
