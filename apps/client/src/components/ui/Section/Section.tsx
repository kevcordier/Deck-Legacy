import { Divider } from '@components/ui/Divider/Divider';
import { Text } from '@components/ui/Text/Text';
import { Title } from '@components/ui/Title/Title';
import type { ReactNode } from 'react';
import { View } from 'react-native';

interface SectionProps {
  readonly title: string;
  readonly subtitle?: string;
  readonly action?: ReactNode;
  readonly children: ReactNode;
  readonly className?: string;
}

export function Section({ title, subtitle, action, children, className = '' }: SectionProps) {
  return (
    <View className={`gap-3 ${className}`}>
      <View className="flex-row items-center gap-2">
        <Title level={4} className="shrink-0">
          {title}
        </Title>
        {subtitle && <Text className="font-body-italic shrink-0 text-xs">{subtitle}</Text>}
        <View className="flex-1">
          <Divider orientation="horizontal" />
        </View>
        {action && <View className="shrink-0 flex-row items-center gap-1">{action}</View>}
      </View>
      {children}
    </View>
  );
}
