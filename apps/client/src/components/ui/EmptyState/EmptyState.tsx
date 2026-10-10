import { Divider } from '@components/ui/Divider/Divider';
import { FadeInScale } from '@components/ui/FadeInScale/FadeInScale';
import { Text } from '@components/ui/Text/Text';
import { Title } from '@components/ui/Title/Title';
import type { ReactNode } from 'react';
import { View } from 'react-native';

interface EmptyStateProps {
  readonly title: string;
  readonly subtitle?: string;
  readonly action?: ReactNode;
  readonly children?: ReactNode;
}

export function EmptyState({ title, subtitle, action, children }: EmptyStateProps) {
  return (
    <FadeInScale className="flex-1 items-center justify-center gap-4 p-4">
      <Divider color="gradient" className="mb-4 max-w-40" />
      <Title level={1} className="text-center">
        {title}
      </Title>
      {subtitle && <Text className="font-body-italic text-center">{subtitle}</Text>}
      {children}
      {action && <View className="pt-2">{action}</View>}
      <Divider color="gradient" className="mb-4 max-w-40" />
    </FadeInScale>
  );
}
