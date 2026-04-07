import type { Meta, StoryObj } from '@storybook/react-vite';
import { EmptyState } from './EmptyState';
import { Button } from '@components/ui/Button/Button';

const meta: Meta<typeof EmptyState> = {
  title: 'Components/EmptyState',
  component: EmptyState,
  parameters: {
    layout: 'centered',
  },
  argTypes: {
    title: { control: 'text' },
    subtitle: { control: 'text' },
  },
};

export default meta;
type Story = StoryObj<typeof EmptyState>;

export const Default: Story = {
  args: {
    title: 'Aucune carte',
  },
};

export const WithSubtitle: Story = {
  args: {
    title: 'Défausse vide',
    subtitle: "Vous n'avez pas encore défaussé de cartes.",
  },
};

export const WithAction: Story = {
  args: {
    title: 'Deck vide',
    subtitle: 'Votre deck est épuisé. Commencez une nouvelle partie ?',
    action: (
      <Button color="primary" onClick={() => {}}>
        Nouvelle partie
      </Button>
    ),
  },
};
