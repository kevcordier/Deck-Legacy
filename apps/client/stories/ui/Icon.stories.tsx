import { IconColors } from '@components/ui/Icon/iconColors';
import { ActivatedIcon } from '@components/ui/Icon/icons/ActivatedIcon';
import { BorderDisputeIcon } from '@components/ui/Icon/icons/BorderDisputeIcon';
import { CrownIcon } from '@components/ui/Icon/icons/CrownIcon';
import { DestroyIcon } from '@components/ui/Icon/icons/DestroyIcon';
import { DotsVerticalIcon } from '@components/ui/Icon/icons/DotsVerticalIcon';
import { GloryIcon } from '@components/ui/Icon/icons/GloryIcon';
import { GoldIcon } from '@components/ui/Icon/icons/GoldIcon';
import { GoodsIcon } from '@components/ui/Icon/icons/GoodsIcon';
import { IronIcon } from '@components/ui/Icon/icons/IronIcon';
import { PassifIcon } from '@components/ui/Icon/icons/PassifIcon';
import { PencilIcon } from '@components/ui/Icon/icons/PencilIcon';
import { ProsperityIcon } from '@components/ui/Icon/icons/ProsperityIcon';
import { RiddingTheWoodsIcon } from '@components/ui/Icon/icons/RiddingTheWoodsIcon';
import { StickerIcon } from '@components/ui/Icon/icons/StickerIcon';
import { StoneIcon } from '@components/ui/Icon/icons/StoneIcon';
import { TimeIcon } from '@components/ui/Icon/icons/TimeIcon';
import { TriggerIcon } from '@components/ui/Icon/icons/TriggerIcon';
import { TrophyIcon } from '@components/ui/Icon/icons/TrophyIcon';
import { WaterMillIcon } from '@components/ui/Icon/icons/WaterMillIcon';
import { WeaponIcon } from '@components/ui/Icon/icons/WeaponIcon';
import { WoodIcon } from '@components/ui/Icon/icons/WoodIcon';
import { ZoomInIcon } from '@components/ui/Icon/icons/ZoomInIcon';
import { ZoomOutIcon } from '@components/ui/Icon/icons/ZoomOutIcon';
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
  { name: 'Pencil', Component: PencilIcon, color: 'currentColor' },
  { name: 'Trophy', Component: TrophyIcon, color: 'currentColor' },
  { name: 'DotsVertical', Component: DotsVerticalIcon, color: 'currentColor' },
  { name: 'Activated', Component: ActivatedIcon, color: 'currentColor' },
  { name: 'Passif', Component: PassifIcon, color: 'currentColor' },
  { name: 'Sticker', Component: StickerIcon, color: 'currentColor' },
  { name: 'Prosperity', Component: ProsperityIcon, color: IconColors.gold },
  { name: 'The Water Mill', Component: WaterMillIcon, color: IconColors.wood },
  { name: 'Border Dispute', Component: BorderDisputeIcon, color: IconColors.iron },
  { name: 'Ridding the Woods', Component: RiddingTheWoodsIcon, color: IconColors.wood },
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
