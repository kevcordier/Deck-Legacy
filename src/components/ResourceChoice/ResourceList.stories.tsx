import type { Meta, StoryObj } from '@storybook/react-vite';
import { ResourceList } from './ResourceList';

const meta: Meta<typeof ResourceList> = {
  title: 'Components/Resource/ResourceList',
  component: ResourceList,
  parameters: {
    layout: 'centered',
  },
};

export default meta;
type Story = StoryObj<typeof ResourceList>;

export const SingleResource: Story = {
  args: {
    resourceOptions: [{ gold: 1 }],
  },
};

export const MultipleOfSameResource: Story = {
  args: {
    resourceOptions: [{ wood: 3 }],
  },
};

export const MixedResources: Story = {
  args: {
    resourceOptions: [{ gold: 1, wood: 2 }],
  },
};

export const ChoiceOptions: Story = {
  args: {
    resourceOptions: [{ gold: 2 }, { wood: 1, stone: 1 }],
  },
};

export const Empty: Story = {
  args: {
    resourceOptions: [],
  },
};
