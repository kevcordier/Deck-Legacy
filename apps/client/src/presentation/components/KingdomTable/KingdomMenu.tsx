import type { KingdomRow } from './KingdomRow';
import { Button } from '@components/ui/Button/Button';
import { DestroyIcon } from '@components/ui/Icon/icons/DestroyIcon';
import { DotsVerticalIcon } from '@components/ui/Icon/icons/DotsVerticalIcon';
import { EyeIcon } from '@components/ui/Icon/icons/EyeIcon';
import { PencilIcon } from '@components/ui/Icon/icons/PencilIcon';
import { Text } from '@components/ui/Text/Text';
import { Tooltip } from '@components/ui/Tooltip/Tooltip';
import type { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { View } from 'react-native';

const MENU_WIDTH = 240;

/**
 * Button (by default "⋮") opening a popover with the kingdom's actions (view its cards, view its
 * destroyed cards, rename it, delete it); only the given actions are listed.
 */
export function KingdomMenu<T extends KingdomRow>({
  kingdom,
  onView,
  onViewDestroyed,
  onRename,
  onDelete,
  className = 'min-h-11 min-w-11 items-center justify-center active:opacity-70',
  children = <DotsVerticalIcon className="size-5" />,
}: {
  readonly kingdom: T;
  readonly onView?: (kingdom: T) => void;
  readonly onViewDestroyed?: (kingdom: T) => void;
  readonly onRename?: (kingdom: T) => void;
  readonly onDelete?: (kingdom: T) => void;
  readonly className?: string;
  readonly children?: ReactNode;
}) {
  const { t } = useTranslation();
  const items = [
    { key: 'view', label: t('kingdom.view'), Icon: EyeIcon, action: onView },
    { key: 'rename', label: t('kingdom.rename'), Icon: PencilIcon, action: onRename },
    { key: 'delete', label: t('kingdom.deleteAction'), Icon: DestroyIcon, action: onDelete },
    {
      key: 'destroyed',
      label: t('kingdom.destroyedCards'),
      Icon: DestroyIcon,
      action: onViewDestroyed,
    },
  ];
  return (
    <Tooltip
      interactive
      position="bottom"
      maxWidth={MENU_WIDTH}
      accessibilityLabel={t('kingdom.menu', { name: kingdom.name })}
      className={className}
      content={close =>
        items.map(
          ({ key, label, Icon, action }) =>
            action && (
              <Button
                key={key}
                size="md"
                variant="text"
                color={key === 'delete' || key === 'destroyed' ? 'danger' : 'ink'}
                font="body"
                className="min-h-11 justify-start"
                onPress={() => {
                  close();
                  action(kingdom);
                }}
              >
                <View className="flex-row items-center gap-2">
                  <Icon className="size-5" color="currentColor" />
                  <Text>{label}</Text>
                </View>
              </Button>
            ),
        )
      }
    >
      {children}
    </Tooltip>
  );
}
