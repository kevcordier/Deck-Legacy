import { TextStyle } from '@components/ui/Text/Text';
import { type ReactNode, useRef, useState } from 'react';
import { Modal, Pressable, View, useWindowDimensions } from 'react-native';

interface TooltipProps {
  readonly children: ReactNode;
  readonly content: ReactNode;
  /** Classes of the trigger wrapper. */
  readonly className?: string;
  /** Classes of the tooltip panel. */
  readonly contentClassName?: string;
  readonly position?: 'top' | 'bottom';
  readonly accessibilityLabel?: string;
}

type Anchor = { x: number; y: number; width: number; height: number };

const GAP = 8;
const MARGIN = 8;
const MAX_WIDTH = 256;

/** Toggles `content` in a floating panel when the trigger is pressed. */
export function Tooltip({
  children,
  content,
  className = '',
  contentClassName = '',
  position = 'top',
  accessibilityLabel,
}: TooltipProps) {
  const triggerRef = useRef<View>(null);
  const [anchor, setAnchor] = useState<Anchor | null>(null);
  const { width: windowWidth, height: windowHeight } = useWindowDimensions();

  const open = () => {
    triggerRef.current?.measureInWindow((x, y, width, height) =>
      setAnchor({ x, y, width, height }),
    );
  };
  const close = () => setAnchor(null);

  const left = anchor
    ? Math.min(
        Math.max(MARGIN, anchor.x + anchor.width / 2 - MAX_WIDTH / 2),
        windowWidth - MAX_WIDTH - MARGIN,
      )
    : 0;
  const verticalPosition =
    position === 'bottom'
      ? { top: (anchor?.y ?? 0) + (anchor?.height ?? 0) + GAP }
      : { bottom: windowHeight - (anchor?.y ?? 0) + GAP };

  return (
    <>
      <Pressable
        ref={triggerRef}
        onPress={() => (anchor ? close() : open())}
        accessibilityRole="button"
        accessibilityLabel={accessibilityLabel}
        className={`flex-row ${className}`}
      >
        {children}
      </Pressable>

      <Modal visible={anchor !== null} transparent animationType="fade" onRequestClose={close}>
        <Pressable className="flex-1" onPress={close} accessibilityRole="none">
          <View
            accessibilityRole="text"
            className={`border-base-ink/20 bg-card absolute rounded-md border p-2 shadow-md ${contentClassName}`}
            style={{ left, maxWidth: MAX_WIDTH, ...verticalPosition }}
          >
            <TextStyle className="text-base-ink text-xs">{content}</TextStyle>
          </View>
        </Pressable>
      </Modal>
    </>
  );
}
