import type { ReactNode } from 'react';
import { Title } from '@components/ui/Title/Title';
import { Divider } from '@components/ui/Divider/Divider';

interface SectionProps {
  title: string;
  subtitle?: string;
  children: ReactNode;
}

export function Section({ title, subtitle, children }: SectionProps) {
  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-baseline gap-2 text-center">
        <Title level={3} className="shrink-0">
          {title}
        </Title>
        {subtitle && <span className="shrink-0 text-xs italic">{subtitle}</span>}
        <Divider orientation="horizontal" className="relative -top-px" />
      </div>
      {children}
    </div>
  );
}
