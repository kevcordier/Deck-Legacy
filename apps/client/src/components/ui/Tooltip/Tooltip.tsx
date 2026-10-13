import { TextRoot, TextStyle } from '@components/ui/Text/Text';
import { type ReactNode, useRef, useState } from 'react';
import {
  type GestureResponderEvent,
  Modal,
  type PointerEvent,
  Pressable,
  View,
  useWindowDimensions,
} from 'react-native';

interface TooltipProps {
  readonly children: ReactNode;
  readonly content: ReactNode;
  /** Classes of the trigger wrapper. */
  readonly className?: string;
  /** Classes of the tooltip panel. */
  readonly contentClassName?: string;
  readonly position?: 'top' | 'bottom';
  readonly accessibilityLabel?: string;
  /**
   * `press` (default): the trigger is a button toggling the panel.
   * `hover` / `hoverOrTap`: the trigger is a plain view (it can sit inside a button) opened by
   * the mouse (web, iPad pointer), and also by a touch tap with `hoverOrTap`.
   */
  readonly openOn?: 'press' | 'hover' | 'hoverOrTap';
  /** Panel max width (defaults to 256). */
  readonly maxWidth?: number;
  /** Called when the trigger is clicked while the panel covers it (hover modes). */
  readonly onTriggerPress?: () => void;
  /** No panel background, border nor padding (e.g. around a card preview). */
  readonly bare?: boolean;
}

type Anchor = { x: number; y: number; width: number; height: number };

const GAP = 8;
const MARGIN = 8;
const DEFAULT_MAX_WIDTH = 256;

/** Prefers `position`, flips to the other side when the panel does not fit, then keeps it on screen. */
function panelTop(
  anchor: Anchor,
  panelHeight: number,
  position: 'top' | 'bottom',
  windowHeight: number,
): number {
  const above = anchor.y - GAP - panelHeight;
  const below = anchor.y + anchor.height + GAP;
  const fitsAbove = above >= MARGIN;
  const fitsBelow = below + panelHeight <= windowHeight - MARGIN;
  let raw = position === 'top' ? above : below;
  if (position === 'top' && !fitsAbove && fitsBelow) raw = below;
  if (position === 'bottom' && !fitsBelow && fitsAbove) raw = above;
  return Math.max(MARGIN, Math.min(raw, windowHeight - panelHeight - MARGIN));
}

/** Shows `content` in a floating panel when the trigger is pressed or hovered (see `openOn`). */
export function Tooltip({
  children,
  content,
  className = '',
  contentClassName = '',
  position = 'top',
  accessibilityLabel,
  openOn = 'press',
  maxWidth = DEFAULT_MAX_WIDTH,
  bare = false,
  onTriggerPress,
}: TooltipProps) {
  const triggerRef = useRef<View>(null);
  const [anchor, setAnchor] = useState<Anchor | null>(null);
  const [panelHeight, setPanelHeight] = useState<number | null>(null);
  const { width: windowWidth, height: windowHeight } = useWindowDimensions();

  const open = () => {
    triggerRef.current?.measureInWindow((x, y, width, height) =>
      setAnchor({ x, y, width, height }),
    );
  };
  const close = () => {
    setAnchor(null);
    setPanelHeight(null);
  };

  const isOverTrigger = (x: number, y: number) =>
    anchor !== null &&
    x >= anchor.x &&
    x <= anchor.x + anchor.width &&
    y >= anchor.y &&
    y <= anchor.y + anchor.height;

  // The modal covers the trigger once open, so hover-out and clicks on it are detected on the backdrop.
  const closeWhenPointerLeaves = (event: PointerEvent) => {
    if (openOn === 'press') return;
    if (!isOverTrigger(event.nativeEvent.clientX, event.nativeEvent.clientY)) close();
  };
  const pressBackdrop = (event: GestureResponderEvent) => {
    close();
    if (isOverTrigger(event.nativeEvent.pageX, event.nativeEvent.pageY)) onTriggerPress?.();
  };

  const left = anchor
    ? Math.min(
        Math.max(MARGIN, anchor.x + anchor.width / 2 - maxWidth / 2),
        windowWidth - maxWidth - MARGIN,
      )
    : 0;

  const top =
    anchor && panelHeight !== null ? panelTop(anchor, panelHeight, position, windowHeight) : 0;

  return (
    <>
      {openOn === 'press' ? (
        <Pressable
          ref={triggerRef}
          onPress={() => (anchor ? close() : open())}
          accessibilityRole="button"
          accessibilityLabel={accessibilityLabel}
          className={`flex-row ${className}`}
        >
          {children}
        </Pressable>
      ) : (
        <View
          ref={triggerRef}
          onPointerEnter={event => {
            if (event.nativeEvent.pointerType !== 'touch') open();
          }}
          onPointerUp={event => {
            if (openOn === 'hoverOrTap' && event.nativeEvent.pointerType === 'touch') open();
          }}
          accessibilityLabel={accessibilityLabel}
          className={`flex-row ${className}`}
        >
          {children}
        </View>
      )}

      <Modal visible={anchor !== null} transparent animationType="fade" onRequestClose={close}>
        <Pressable
          className="flex-1"
          onPress={pressBackdrop}
          onPointerMove={closeWhenPointerLeaves}
          accessibilityRole="none"
        >
          <View
            accessibilityRole="text"
            pointerEvents="none"
            onLayout={event => setPanelHeight(event.nativeEvent.layout.height)}
            className={`absolute ${bare ? '' : 'border-base-ink/20 bg-card rounded-md border p-2 shadow-md'} ${contentClassName}`}
            // Hidden until measured, so it never flashes at the wrong place.
            style={{ left, top, maxWidth, opacity: panelHeight === null ? 0 : 1 }}
          >
            <TextRoot>
              {bare ? content : <TextStyle className="text-base-ink text-xs">{content}</TextStyle>}
            </TextRoot>
          </View>
        </Pressable>
      </Modal>
    </>
  );
}
