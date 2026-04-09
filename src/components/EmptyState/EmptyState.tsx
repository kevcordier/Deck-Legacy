import type { ReactNode } from 'react';
import { Title } from '@components/ui/Title/Title';
import { Divider } from '@components/ui/Divider/Divider';

interface EmptyStateProps {
  title: string;
  subtitle?: string;
  action?: ReactNode;
}

export function EmptyState({ title, subtitle, action }: EmptyStateProps) {
  return (
    <div className="animate-fade-in-scale flex h-full flex-1 flex-col items-center justify-center gap-4 p-6 text-center">
      <Divider color="gradient" className="mb-4 h-px max-w-40" />
      <Title level={1}>{title}</Title>
      {subtitle && <p className="italic">{subtitle}</p>}
      {action && <div className="pt-2">{action}</div>}
      <Divider color="gradient" className="mb-4 h-px max-w-40" />
    </div>
  );
}
