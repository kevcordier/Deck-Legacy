import { Button } from '@components/ui/Button/Button';
import { EyeIcon, EyeOffIcon } from '@components/ui/Icon/icon';
import { type ReactNode, useEffect } from 'react';
import ReactModal from 'react-modal';

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
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (peeking) {
          onPeekToggle?.();
          e.preventDefault();
        } else if (!onClose) {
          e.preventDefault();
        }
      }
    };
    globalThis.addEventListener('keydown', handleKey);
    return () => globalThis.removeEventListener('keydown', handleKey);
  }, [onClose, onPeekToggle, peeking]);

  const contentClass = peeking
    ? `bg-transparent z-120 border-transparent m-auto flex max-h-[90vh] w-[calc(100vw-1rem)] flex-col items-start justify-start gap-6 rounded-2xl border p-4 outline-none lg:max-h-[80vh] lg:w-fit lg:max-w-[80vw] lg:p-6 ${className}`
    : `bg-background relative z-120 border-border m-auto text-ink flex max-h-[90vh] w-[calc(100vw-1rem)] flex-col items-start justify-start gap-6 rounded-2xl border p-4 outline-none lg:max-h-[80vh] lg:w-fit lg:max-w-[80vw] lg:p-6 ${className}`;

  const overlayClass = peeking
    ? 'fixed z-120 inset-0 flex items-center justify-center'
    : 'fixed z-120 inset-0 flex items-center justify-center bg-black/60 backdrop-blur-md';

  return (
    <ReactModal
      isOpen
      onRequestClose={onClose}
      shouldCloseOnOverlayClick={!!onClose}
      shouldCloseOnEsc={false}
      className={contentClass}
      overlayClassName={overlayClass}
      ariaHideApp={false}
      parentSelector={() => document.querySelector('#root') as HTMLElement}
    >
      {onPeekToggle && (
        <button
          onClick={onPeekToggle}
          className="bg-background border-border text-ink fixed top-4 right-4 z-120 flex h-10 w-10 items-center justify-center rounded-full border shadow-md transition-opacity hover:opacity-80 cursor-pointer"
          aria-label={peeking ? 'Afficher la modale' : 'Masquer la modale'}
        >
          {peeking ? <EyeOffIcon className="h-5 w-5" /> : <EyeIcon className="h-5 w-5" />}
        </button>
      )}
      <div
        className={`flex w-full items-start justify-between ${peeking ? 'pointer-events-none opacity-0' : ''}`}
      >
        <div>
          {title && <div className="text-primary font-bold uppercase">{title}</div>}
          {subtitle && <div className="text-ink text-sm">{subtitle}</div>}
        </div>
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
    </ReactModal>
  );
}
