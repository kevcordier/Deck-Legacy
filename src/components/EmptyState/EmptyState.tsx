import type { ReactNode } from 'react';
import './EmptyState.css';

interface EmptyStateProps {
  title: string;
  subtitle?: string;
  action?: ReactNode;
}

export function EmptyState({ title, subtitle, action }: EmptyStateProps) {
  return (
    <div className="es-root">
      <div className="es-divider" />
      <h1 className="es-title">{title}</h1>
      {subtitle && <p className="es-subtitle">{subtitle}</p>}
      {action && <div className="es-action">{action}</div>}
      <div className="es-divider" />
    </div>
  );
}
