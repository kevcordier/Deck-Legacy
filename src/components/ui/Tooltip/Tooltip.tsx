import { type ReactNode, useCallback, useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';

interface TooltipProps {
  readonly children: ReactNode;
  readonly content: ReactNode;
  readonly className?: string;
  readonly contentClassName?: string;
  readonly position?: 'top' | 'bottom';
}

export function Tooltip({
  children,
  content,
  className = '',
  contentClassName = '',
  position = 'top',
}: TooltipProps) {
  const triggerRef = useRef<HTMLSpanElement>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [coords, setCoords] = useState({ top: 0, left: 0 });

  const updatePosition = useCallback(() => {
    const trigger = triggerRef.current;
    if (!trigger) return;

    const rect = trigger.getBoundingClientRect();
    const gap = 8;

    setCoords({
      left: rect.left + rect.width / 2,
      top: position === 'bottom' ? rect.bottom + gap : rect.top - gap,
    });
  }, [position]);

  const openTooltip = useCallback(() => {
    updatePosition();
    setIsOpen(true);
  }, [updatePosition]);

  const closeTooltip = useCallback(() => {
    setIsOpen(false);
  }, []);

  useEffect(() => {
    const trigger = triggerRef.current;
    if (!trigger) return;

    const handleFocusOut = (event: FocusEvent) => {
      const nextTarget = event.relatedTarget;
      if (!(nextTarget instanceof Node) || !trigger.contains(nextTarget)) {
        closeTooltip();
      }
    };

    trigger.addEventListener('mouseenter', openTooltip);
    trigger.addEventListener('mouseleave', closeTooltip);
    trigger.addEventListener('focusin', openTooltip);
    trigger.addEventListener('focusout', handleFocusOut);

    return () => {
      trigger.removeEventListener('mouseenter', openTooltip);
      trigger.removeEventListener('mouseleave', closeTooltip);
      trigger.removeEventListener('focusin', openTooltip);
      trigger.removeEventListener('focusout', handleFocusOut);
    };
  }, [closeTooltip, openTooltip]);

  useEffect(() => {
    if (!isOpen) return;

    const handleWindowChange = () => {
      updatePosition();
    };

    window.addEventListener('resize', handleWindowChange);
    window.addEventListener('scroll', handleWindowChange, true);

    return () => {
      window.removeEventListener('resize', handleWindowChange);
      window.removeEventListener('scroll', handleWindowChange, true);
    };
  }, [isOpen, updatePosition]);

  const tooltipClassName =
    position === 'bottom' ? 'translate-x-[-50%]' : 'translate-x-[-50%] translate-y-[-100%]';

  return (
    <span ref={triggerRef} className={`relative inline-flex ${className}`}>
      {children}
      {isOpen &&
        createPortal(
          <span
            role="tooltip"
            className={`pointer-events-none fixed z-[999] w-max max-w-64 rounded-md border border-base-ink/20 bg-card p-2 text-base-ink text-xs shadow-md ${tooltipClassName} ${contentClassName}`}
            style={{ top: coords.top, left: coords.left }}
          >
            {content}
          </span>,
          document.body,
        )}
    </span>
  );
}
