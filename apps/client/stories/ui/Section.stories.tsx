import { Section } from '@components/ui/Section/Section';
import { Text } from '@components/ui/Text/Text';
import type { Meta, StoryObj } from '@storybook/react-native';
import { View } from 'react-native';

const meta: Meta<typeof Section> = {
  title: 'UI/Section',
  component: Section,
  parameters: {
    layout: 'padded',
  },
  argTypes: {
    title: { control: 'text' },
    subtitle: { control: 'text' },
  },
};

export default meta;
type Story = StoryObj<typeof Section>;

export const Default: Story = {
  args: {
    title: 'Tableau de bord',
    children: <Text>Contenu de la section</Text>,
  },
};

export const WithSubtitle: Story = {
  args: {
    title: 'Inventaire',
    subtitle: '12 cartes disponibles',
    children: <Text>Contenu de la section</Text>,
  },
};

export const WithRichContent: Story = {
  args: {
    title: 'Plateau de jeu',
    subtitle: 'Tour 3 — Manche 2',
    children: (
      <View className="flex-row flex-wrap gap-2">
        {['Carte A', 'Carte B', 'Carte C'].map(c => (
          <View key={c} className="bg-card border-primary rounded-lg border px-4 py-3">
            <Text className="text-base-ink">{c}</Text>
          </View>
        ))}
      </View>
    ),
  },
};
