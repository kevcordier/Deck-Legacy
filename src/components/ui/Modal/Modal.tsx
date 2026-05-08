import { Button } from '@components/ui/Button/Button';
import { EyeIcon, EyeOffIcon } from '@components/ui/Icon/icon';
import { type ReactNode, useEffect, useRef } from 'react';

export type ModalProps = {
  readonly title?: ReactNode;
  readonly subtitle?: ReactNode | null;
  readonly children: React.ReactNode;
  readonly onClose?: () => void;
  readonly className?: string;
  readonly peeking?: boolean;
  readonly onPeekToggle?: () => void;
};

export function Modal({
  title,
  subtitle,
  children,
  onClose,
  className = '',
  peeking = false,
  onPeekToggle,
}: ModalProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    dialogRef.current?.showModal();
  }, []);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    const handleClose = () => onClose?.();
    const handleCancel = (e: Event) => {
      if (!onClose) e.preventDefault();
    };

    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (peeking) {
          onPeekToggle?.();
          e.preventDefault();
          return;
        }
        if (onClose) onClose();
        else e.preventDefault();
      }
    };

    globalThis.addEventListener('keydown', handleKey);
    dialog.addEventListener('close', handleClose);
    dialog.addEventListener('cancel', handleCancel);
    return () => {
      globalThis.removeEventListener('keydown', handleKey);
      dialog.removeEventListener('close', handleClose);
      dialog.removeEventListener('cancel', handleCancel);
    };
  }, [onClose, onPeekToggle, peeking]);

  const dialogClass = peeking
    ? `bg-transparent border-transparent m-auto flex max-h-[90vh] w-[calc(100vw-1rem)] flex-col items-start justify-start gap-6 rounded-2xl border p-4 outline-none backdrop:opacity-0 lg:max-h-[80vh] lg:w-fit lg:max-w-[80vw] lg:p-6 ${className}`
    : `bg-background border-border m-auto text-ink flex max-h-[90vh] w-[calc(100vw-1rem)] flex-col items-start justify-start gap-6 rounded-2xl border p-4 outline-none backdrop:bg-black/60 backdrop:backdrop-blur-md lg:max-h-[80vh] lg:w-fit lg:max-w-[80vw] lg:p-6 ${className}`;

  return (
    <dialog ref={dialogRef} className={dialogClass}>
      {onPeekToggle && (
        <button
          onClick={onPeekToggle}
          className="bg-background border-border text-ink fixed top-4 right-4 z-50 flex h-10 w-10 items-center justify-center rounded-full border shadow-md transition-opacity hover:opacity-80"
          aria-label={peeking ? 'Afficher la modale' : 'Masquer la modale'}
        >
          {peeking ? <EyeOffIcon className="h-5 w-5" /> : <EyeIcon className="h-5 w-5" />}
        </button>
      )}
      <div
        className={`flex w-full items-start justify-between ${peeking ? 'pointer-events-none opacity-0' : ''}`}
      >
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
      <div
        className={`scrollbar flex min-h-0 w-full flex-col justify-start gap-6 overflow-y-auto p-1 ${peeking ? 'pointer-events-none opacity-0' : ''}`}
      >
        {children}
      </div>
    </dialog>
  );
}
