import { Button } from '@components/ui/Button/Button';
import type { ReactNode } from 'react';

export type ModalProps = {
  readonly title?: ReactNode;
  readonly subtitle?: ReactNode | null;
  readonly children: React.ReactNode;
  readonly onClose?: () => void;
  readonly className?: string;
};

export function Modal({ title, subtitle, children, onClose, className = '' }: ModalProps) {
  return (
    <div
      className="fixed inset-0 z-200 flex items-center justify-center bg-black/60 backdrop-blur-md"
      onClick={onClose}
    >
      <div
        className={`bg-background border-border flex h-screen w-screen flex-col items-start justify-start gap-6 rounded-none border-0 p-4 lg:h-auto lg:max-h-[80vh] lg:w-auto lg:min-w-md lg:max-w-[70vw] lg:rounded-2xl lg:border lg:p-6 ${className}`}
        onClick={e => e.stopPropagation()}
      >
        <div className="flex w-full items-start justify-between">
          {title || subtitle ? (
            <div>
              {title && <div className="text-primary font-bold uppercase">{title}</div>}
              {subtitle && <div className="text-ink text-sm">{subtitle}</div>}
            </div>
          ) : null}
          {onClose && (
            <Button onClick={onClose} variant="text" color="ink" size="sm">
              ✕
            </Button>
          )}
        </div>
        <div className="scrollbar flex min-h-0 w-full flex-1 flex-col justify-start gap-6 overflow-y-auto p-1">
          {children}
        </div>
      </div>
    </div>
  );
}
