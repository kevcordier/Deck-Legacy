import {
  ActivatedIcon,
  CrownIcon,
  DestroyIcon,
  GloryIcon,
  GoldIcon,
  GoodsIcon,
  IconColors,
  IronIcon,
  PassifIcon,
  StoneIcon,
  TimeIcon,
  TriggerIcon,
  WeaponIcon,
  WoodIcon,
} from './icon';
import type { Meta, StoryObj } from '@storybook/react-vite';

const AllIconsMeta: Meta = {
  title: 'UI/Icons',
  parameters: {
    layout: 'padded',
  },
};

export default AllIconsMeta;

type Story = StoryObj<typeof AllIconsMeta>;

const ICONS = [
  { name: 'Gold', Component: GoldIcon, color: IconColors.gold },
  { name: 'Wood', Component: WoodIcon, color: IconColors.wood },
  { name: 'Stone', Component: StoneIcon, color: IconColors.stone },
  { name: 'Iron', Component: IronIcon, color: IconColors.iron },
  { name: 'Weapon', Component: WeaponIcon, color: IconColors.iron },
  { name: 'Goods', Component: GoodsIcon, color: IconColors.wood },
  { name: 'Glory', Component: GloryIcon, color: IconColors.gold },
  { name: 'Crown', Component: CrownIcon, color: 'currentColor' },
  { name: 'Destroy', Component: DestroyIcon, color: 'currentColor' },
  { name: 'Activated', Component: ActivatedIcon, color: 'currentColor' },
  { name: 'Passif', Component: PassifIcon, color: 'currentColor' },
  { name: 'Time', Component: TimeIcon, color: 'currentColor' },
  { name: 'Trigger', Component: TriggerIcon, color: 'currentColor' },
];

export const AllIcons: Story = {
  render: () => (
    <div
      style={{
        display: 'flex',
        flexWrap: 'wrap',
        gap: '24px',
        color: 'var(--cream)',
      }}
    >
      {ICONS.map(({ name, Component, color }) => (
        <div
          key={name}
          style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px' }}
        >
          <Component color={color} className="size-8" />
          <span style={{ fontSize: '11px' }}>{name}</span>
        </div>
      ))}
    </div>
  ),
};

export const ResourceIcons: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: '16px', alignItems: 'center', color: 'var(--cream)' }}>
      {(['sm', 'md', 'lg'] as const).map(size => {
        const sizeClasses = { sm: 'size-4', md: 'size-8', lg: 'size-12' }[size];
        return (
          <div
            key={size}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}
          >
            <span style={{ fontSize: '11px' }}>{size}</span>
            <div style={{ display: 'flex', gap: '8px' }}>
              <GoldIcon color={IconColors.gold} className={sizeClasses} />
              <WoodIcon color={IconColors.wood} className={sizeClasses} />
              <StoneIcon color={IconColors.stone} className={sizeClasses} />
              <IronIcon color={IconColors.iron} className={sizeClasses} />
            </div>
          </div>
        );
      })}
    </div>
  ),
};
