import type { ReactNode } from 'react';
import { Title } from '@components/ui/Title/Title';

interface EmptyStateProps {
  title: string;
  subtitle?: string;
  action?: ReactNode;
}

export function EmptyState({ title, subtitle, action }: EmptyStateProps) {
  return (
    <div className="animate-fade-in-scale flex h-full flex-1 flex-col items-center justify-center gap-4 p-6 text-center">
      <div className="via-primary h-px min-w-40 bg-linear-to-r from-transparent to-transparent" />
      <Title level={2}>{title}</Title>
      {subtitle && <p className="italic">{subtitle}</p>}
      {action && <div className="pt-2">{action}</div>}
      <div className="via-primary h-px min-w-40 bg-linear-to-r from-transparent to-transparent" />
    </div>
  );
}
