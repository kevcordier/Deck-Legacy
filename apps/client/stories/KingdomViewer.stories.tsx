import { KingdomViewer } from '@components/KingdomViewer/KingdomViewer';
import { EMPTY_SUMMARY } from '@domain/kingdom/emptySummary';
import type { Meta, StoryObj } from '@storybook/react-native';

const meta: Meta<typeof KingdomViewer> = {
  title: 'Components/KingdomViewer',
  component: KingdomViewer,
  argTypes: { onClose: { action: 'close' } },
};

export default meta;
type Story = StoryObj<typeof KingdomViewer>;

/** A kingdom without a local save: every zone is empty. */
export const NotStarted: Story = {
  args: { kingdom: { id: 'story-kingdom', name: 'Avalon', createdAt: 0, summary: EMPTY_SUMMARY } },
};
