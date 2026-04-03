import type { Meta, StoryObj } from '@storybook/react';
import { OptionsModal } from './OptionsModal';

const meta: Meta<typeof OptionsModal> = {
  title: 'Components/OptionsModal',
  component: OptionsModal,
  parameters: {
    layout: 'fullscreen',
  },
  argTypes: {
    onClose: { action: 'closed' },
    onReset: { action: 'reset' },
  },
};

export default meta;
type Story = StoryObj<typeof OptionsModal>;

export const Default: Story = {
  args: {},
};
