import { Modal } from './Modal';
import type { Meta, StoryObj } from '@storybook/react-vite';

const meta: Meta<typeof Modal> = {
  title: 'UI/Modal',
  component: Modal,
  parameters: {
    layout: 'fullscreen',
  },
  argTypes: {
    title: { control: 'text' },
    subtitle: { control: 'text' },
    onClose: { action: 'closed' },
  },
};

export default meta;
type Story = StoryObj<typeof Modal>;

export const Default: Story = {
  args: {
    title: 'Règles du jeu',
    children: <p style={{ color: 'var(--cream)' }}>Contenu du modal.</p>,
  },
};

export const WithSubtitle: Story = {
  args: {
    title: 'Options',
    subtitle: 'Paramètres de la partie',
    children: <p style={{ color: 'var(--cream)' }}>Contenu du modal.</p>,
  },
};

export const WithCloseButton: Story = {
  args: {
    title: 'Inventaire',
    subtitle: '12 cartes',
    onClose: () => {},
    children: <p style={{ color: 'var(--cream)' }}>Cliquez en dehors ou sur ✕ pour fermer.</p>,
  },
};

export const WithScrollableContent: Story = {
  args: {
    title: 'Liste des cartes',
    onClose: () => {},
    children: (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        {Array.from({ length: 20 }, (_, i) => (
          <div
            key={i}
            style={{
              padding: '8px 12px',
              background: 'var(--dark-blue)',
              borderRadius: '6px',
              color: 'var(--cream)',
            }}
          >
            Carte {i + 1}
          </div>
        ))}
      </div>
    ),
  },
};
