import {
  ActivatedIcon,
  BorderDisputeIcon,
  CrownIcon,
  DestroyIcon,
  GloryIcon,
  GoldIcon,
  GoodsIcon,
  IronIcon,
  PassifIcon,
  ProsperityIcon,
  StoneIcon,
  TimeIcon,
  TriggerIcon,
  WaterMillIcon,
  WeaponIcon,
  WoodIcon,
  ZoomInIcon,
  ZoomOutIcon,
} from '@components/ui/Icon/icon';
import { IconColors } from '@components/ui/Icon/iconColors';
import { Text } from '@components/ui/Text/Text';
import type { Meta, StoryObj } from '@storybook/react-native';
import { View } from 'react-native';

const AllIconsMeta: Meta = {
  title: 'UI/Icons',
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
  { name: 'Zoom in', Component: ZoomInIcon, color: 'currentColor' },
  { name: 'Zoom out', Component: ZoomOutIcon, color: 'currentColor' },
  { name: 'Destroy', Component: DestroyIcon, color: 'currentColor' },
  { name: 'Activated', Component: ActivatedIcon, color: 'currentColor' },
  { name: 'Passif', Component: PassifIcon, color: 'currentColor' },
  { name: 'Prosperity', Component: ProsperityIcon, color: IconColors.gold },
  { name: 'The Water Mill', Component: WaterMillIcon, color: IconColors.wood },
  { name: 'Border Dispute', Component: BorderDisputeIcon, color: IconColors.iron },
  { name: 'Time', Component: TimeIcon, color: 'currentColor' },
  { name: 'Trigger', Component: TriggerIcon, color: 'currentColor' },
];

export const AllIcons: Story = {
  render: () => (
    <View className="flex-row flex-wrap gap-6">
      {ICONS.map(({ name, Component, color }) => (
        <View key={name} className="items-center gap-1.5">
          <Component color={color} className="size-8" />
          <Text className="text-xs">{name}</Text>
        </View>
      ))}
    </View>
  ),
};

export const ResourceIcons: Story = {
  render: () => (
    <View className="flex-row items-center gap-4">
      {(['sm', 'md', 'lg'] as const).map(size => {
        const sizeClasses = { sm: 'size-4', md: 'size-8', lg: 'size-12' }[size];
        return (
          <View key={size} className="items-center gap-2">
            <Text className="text-xs">{size}</Text>
            <View className="flex-row gap-2">
              <GoldIcon color={IconColors.gold} className={sizeClasses} />
              <WoodIcon color={IconColors.wood} className={sizeClasses} />
              <StoneIcon color={IconColors.stone} className={sizeClasses} />
              <IronIcon color={IconColors.iron} className={sizeClasses} />
            </View>
          </View>
        );
      })}
    </View>
  ),
};
