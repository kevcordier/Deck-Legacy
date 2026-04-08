import type { Meta, StoryObj } from '@storybook/react-vite';
import { Button } from '@components/ui/Button/Button';

const meta: Meta<typeof Button> = {
  title: 'UI/Button',
  component: Button,
};

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    children: 'Default Button',
  },
};
