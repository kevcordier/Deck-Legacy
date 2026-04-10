import type { Meta, StoryObj } from '@storybook/react-vite';
import { Title } from './Title';

const meta: Meta<typeof Title> = {
  title: 'UI/Title',
  component: Title,
  parameters: {
    layout: 'padded',
  },
  argTypes: {
    level: {
      control: 'inline-radio',
      options: [1, 2, 3, 4],
    },
    children: { control: 'text' },
  },
};

export default meta;
type Story = StoryObj<typeof Title>;

export const H1: Story = {
  args: { level: 1, children: 'Deck Legacy' },
};

export const H2: Story = {
  args: { level: 2, children: 'Tableau de jeu' },
};

export const H3: Story = {
  args: { level: 3, children: 'Cartes permanentes' },
};

export const H4: Story = {
  args: { level: 4, children: 'Détail de la carte' },
};

export const AllLevels: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
      {([1, 2, 3, 4] as const).map(level => (
        <Title key={level} level={level}>
          Niveau {level} — Titre de jeu
        </Title>
      ))}
    </div>
  ),
};
