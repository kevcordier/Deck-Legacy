import { Divider } from '@components/ui/Divider/Divider';
import { Title } from '@components/ui/Title/Title';
import type { ReactNode } from 'react';

interface SectionProps {
  readonly title: string;
  readonly subtitle?: string;
  readonly children: ReactNode;
  readonly className?: string;
}

export function Section({ title, subtitle, children, className = '' }: SectionProps) {
  return (
    <div className={`flex flex-col gap-3 ${className}`}>
      <div className="flex items-baseline gap-2 text-center">
        <Title level={4} className="shrink-0">
          {title}
        </Title>
        {subtitle && <span className="shrink-0 text-xs italic">{subtitle}</span>}
        <Divider orientation="horizontal" className="relative -top-px" />
      </div>
      {children}
    </div>
  );
}
