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
  /** Full-width panel, for content sized in % of it (cards). Otherwise it fits its content. */
  readonly wide?: boolean;
}

export function EmptyState({ title, subtitle, action, children, wide = false }: EmptyStateProps) {
  return (
    <FadeInScale className="flex-1 items-center justify-center p-4">
      {/* Solid panel: the page background image behind it would wash out the text and button. */}
      <View
        className={`bg-background/95 border-border max-w-full items-center gap-4 rounded-2xl border px-4 py-6 lg:px-8 shadow-lg ${wide ? 'w-full lg:max-w-6xl' : ''}`}
      >
        <Title level={1} className="text-center">
          {title}
        </Title>
        {subtitle && <Text className="font-body-italic text-center">{subtitle}</Text>}
        {children}
        {action && <View className="pt-2">{action}</View>}
      </View>
    </FadeInScale>
  );
}
