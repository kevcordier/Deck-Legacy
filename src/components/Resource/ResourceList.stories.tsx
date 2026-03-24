import type { Meta, StoryObj } from '@storybook/react';
import { ResourceList } from './ResourceList';

const meta: Meta<typeof ResourceList> = {
  title: 'ui/ResourceList',
  component: ResourceList,
};

export default meta;
type Story = StoryObj<typeof ResourceList>;

export const SingleOption: Story = {
  args: { resourceOptions: [{ gold: 1 }] },
};

export const MultipleOfSame: Story = {
  args: { resourceOptions: [{ wood: 3 }] },
};

export const Choice: Story = {
  args: { resourceOptions: [{ gold: 1 }, { wood: 1 }] },
};

export const MixedProduction: Story = {
  args: { resourceOptions: [{ wood: 1, gold: 1 }] },
};

export const ThreeWayChoice: Story = {
  args: { resourceOptions: [{ gold: 1 }, { wood: 1 }, { stone: 1 }] },
};
