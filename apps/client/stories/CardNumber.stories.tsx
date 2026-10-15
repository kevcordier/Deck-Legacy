import { CardNumber } from '@components/CardNumber/CardNumber';
import type { Meta, StoryObj } from '@storybook/react-native';

const meta: Meta<typeof CardNumber> = {
  title: 'Components/CardNumber',
  component: CardNumber,
  argTypes: {
    instanceId: { control: { type: 'number' } },
  },
};

export default meta;
type Story = StoryObj<typeof CardNumber>;

export const BaseGame: Story = { args: { instanceId: 12 } };

export const Campaign: Story = { args: { instanceId: 136 } };

/** Ridding the Woods card #1 (global instance id 139). */
export const Expansion: Story = { args: { instanceId: 139 } };
