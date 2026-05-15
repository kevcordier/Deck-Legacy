import { Glory } from '@components/ui/Glory/Glory';
import type { Meta, StoryObj } from '@storybook/react-vite';

const meta: Meta<typeof Glory> = {
  title: 'UI/Glory',
  component: Glory,
  parameters: {
    layout: 'centered',
  },
  argTypes: {
    glory: { control: { type: 'number', min: -10, max: 20, step: 1 } },
  },
  render: arg => <Glory glory={arg.glory} />,
};

export default meta;
type Story = StoryObj<typeof Glory>;

export const Positive: Story = {
  args: { glory: 5 },
};

export const Negative: Story = {
  args: { glory: -2 },
};

export const Zero: Story = {
  args: { glory: 0 },
};
