import { Button } from '@components/ui/Button/Button';

export type ModalProps = {
  title: string;
  subtitle?: string | null;
  children: React.ReactNode;
  onClose?: () => void;
  className?: string;
};

export function Modal({ title, subtitle, children, onClose, className = '' }: ModalProps) {
  return (
    <div
      className="fixed inset-0 z-200 flex items-center justify-center bg-black/60 backdrop-blur-md"
      onClick={onClose}
    >
      <div
        className={`bg-background border-border flex max-h-[80vh] max-w-[80vw] flex-col items-start justify-start gap-6 rounded-2xl border p-6 ${className}`}
        onClick={e => e.stopPropagation()}
      >
        <div className="flex w-full items-start justify-between">
          <div>
            <div className="text-primary font-bold uppercase">{title}</div>
            {subtitle && <div className="text-ink text-sm">{subtitle}</div>}
          </div>
          {onClose && (
            <Button onClick={onClose} variant="text" color="ink" size="sm">
              ✕
            </Button>
          )}
        </div>
        <div className="scrollbar flex flex-col justify-start gap-6 p-1">{children}</div>
      </div>
    </div>
  );
}
