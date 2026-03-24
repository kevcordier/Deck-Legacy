import type { Meta, StoryObj } from '@storybook/react';
import { OptionsModal } from './OptionsModal';

const meta: Meta<typeof OptionsModal> = {
  title: 'game/OptionsModal',
  component: OptionsModal,
  parameters: { layout: 'fullscreen' },
  args: {
    onClose: () => {},
    onReset: () => {},
  },
};

export default meta;
type Story = StoryObj<typeof OptionsModal>;

export const Default: Story = {};
