import type { Meta, StoryObj } from '@storybook/react';
import { Section } from './Section';

const meta: Meta<typeof Section> = {
  title: 'layout/Section',
  component: Section,
  args: {
    title: 'Tableau',
    children: <p style={{ color: '#aaa' }}>Section content goes here.</p>,
  },
};

export default meta;
type Story = StoryObj<typeof Section>;

export const Default: Story = {};

export const WithSubtitle: Story = {
  args: { subtitle: '4 cards in play' },
};

export const LongTitle: Story = {
  args: { title: 'Discovery Pile', subtitle: '12 cards remaining' },
};
