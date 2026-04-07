import type { Meta, StoryObj } from '@storybook/react-vite';

import { Stat } from './Stat';

const meta = {
  title: 'UI/Stat',
  component: Stat,
} satisfies Meta<typeof Stat>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    label: 'label',
    value: 0,
  },
};
