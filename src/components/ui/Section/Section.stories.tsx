import { Section } from './Section';
import type { Meta, StoryObj } from '@storybook/react-vite';

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
    children: <p style={{ color: 'var(--cream)' }}>Contenu de la section</p>,
  },
};

export const WithSubtitle: Story = {
  args: {
    title: 'Inventaire',
    subtitle: '12 cartes disponibles',
    children: <p style={{ color: 'var(--cream)' }}>Contenu de la section</p>,
  },
};

export const WithRichContent: Story = {
  args: {
    title: 'Plateau de jeu',
    subtitle: 'Tour 3 — Manche 2',
    children: (
      <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
        {['Carte A', 'Carte B', 'Carte C'].map(c => (
          <div
            key={c}
            style={{
              background: 'var(--dark-blue)',
              border: '1px solid var(--gold)',
              borderRadius: '8px',
              padding: '12px 16px',
              color: 'var(--cream)',
            }}
          >
            {c}
          </div>
        ))}
      </div>
    ),
  },
};
