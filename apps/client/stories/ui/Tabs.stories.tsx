import { Tabs } from '@components/ui/Tabs/Tabs';
import type { Meta, StoryObj } from '@storybook/react-native';
import { useState } from 'react';
import { View } from 'react-native';

const meta: Meta<typeof Tabs> = {
  title: 'UI/Tabs',
  component: Tabs,
  parameters: {
    layout: 'centered',
  },
};

export default meta;
type Story = StoryObj<typeof Tabs>;

function TabsDemo({ tone }: { readonly tone: 'theme' | 'card' }) {
  const [tab, setTab] = useState('general');
  return (
    <View className={`w-80 p-4 ${tone === 'card' ? 'bg-card' : ''}`}>
      <Tabs
        tone={tone}
        value={tab}
        onChange={setTab}
        tabs={[
          { id: 'general', label: 'Général' },
          { id: 'account', label: 'Compte' },
        ]}
      />
    </View>
  );
}

export const Theme: Story = {
  render: () => <TabsDemo tone="theme" />,
};

export const Card: Story = {
  render: () => <TabsDemo tone="card" />,
};
