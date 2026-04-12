import { OptionsModal } from './OptionsModal';
import type { Meta, StoryObj } from '@storybook/react-vite';

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
