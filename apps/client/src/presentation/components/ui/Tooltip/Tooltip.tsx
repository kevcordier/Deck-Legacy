import { TextRoot } from '@components/ui/Text/TextRoot';
import { TextStyle } from '@components/ui/Text/TextStyle';
import { type ReactNode, useEffect, useRef, useState } from 'react';
import {
  type GestureResponderEvent,
  type HostInstance,
  Modal,
  type PointerEvent,
  Pressable,
  View,
  useWindowDimensions,
} from 'react-native';

interface TooltipProps {
  readonly children: ReactNode;
  /** With `interactive`, a function receives `close` (e.g. after a menu action). */
  readonly content: ReactNode | ((close: () => void) => ReactNode);
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
  /** Milliseconds the pointer must stay on the trigger before a hover opens the panel (taps stay immediate). */
  readonly openDelay?: number;
  /** No panel background, border nor padding (e.g. around a card preview). */
  readonly bare?: boolean;
  /**
   * Popover menu: the panel receives presses, uses the page background and points an arrow at
   * the trigger.
   */
  readonly interactive?: boolean;
}

type Anchor = { x: number; y: number; width: number; height: number };

const GAP = 8;
const MARGIN = 8;
const DEFAULT_MAX_WIDTH = 256;
/** Side of the popover arrow, a square rotated 45° straddling the panel edge. */
const ARROW_SIZE = 12;
const ARROW_INSET = 12;

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
  interactive = false,
  onTriggerPress,
  openDelay = 0,
}: TooltipProps) {
  const triggerRef = useRef<HostInstance>(null);
  const hoverTimerRef = useRef<ReturnType<typeof setTimeout>>(undefined);
  const [anchor, setAnchor] = useState<Anchor | null>(null);
  const [panelSize, setPanelSize] = useState<{ width: number; height: number } | null>(null);
  const { width: windowWidth, height: windowHeight } = useWindowDimensions();

  const open = () => {
    triggerRef.current?.measureInWindow((x, y, width, height) =>
      setAnchor({ x, y, width, height }),
    );
  };
  const cancelHover = () => clearTimeout(hoverTimerRef.current);
  useEffect(() => cancelHover, []);
  const close = () => {
    setAnchor(null);
    setPanelSize(null);
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

  const panelWidth = panelSize?.width ?? maxWidth;
  const anchorCenter = anchor ? anchor.x + anchor.width / 2 : 0;
  const left = anchor
    ? Math.min(Math.max(MARGIN, anchorCenter - panelWidth / 2), windowWidth - panelWidth - MARGIN)
    : 0;

  const panel = typeof content === 'function' ? content(close) : content;

  const top = anchor && panelSize ? panelTop(anchor, panelSize.height, position, windowHeight) : 0;
  const below = anchor !== null && top >= anchor.y + anchor.height;
  const arrowLeft = Math.min(
    Math.max(ARROW_INSET, anchorCenter - left - ARROW_SIZE / 2),
    panelWidth - ARROW_INSET - ARROW_SIZE,
  );

  let surface = 'border-ink-card/20 bg-card rounded-md border p-2 shadow-md';
  if (interactive) surface = 'border-border bg-background rounded-md border p-1 shadow-md';
  if (bare) surface = '';

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
            if (event.nativeEvent.pointerType !== 'touch')
              hoverTimerRef.current = setTimeout(open, openDelay);
          }}
          onPointerLeave={cancelHover}
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
            accessibilityRole={interactive ? 'menu' : 'text'}
            onLayout={event => {
              const { width, height } = event.nativeEvent.layout;
              setPanelSize({ width, height });
            }}
            className={`absolute ${surface} ${contentClassName}`}
            // Hidden until measured, so it never flashes at the wrong place.
            style={{
              left,
              top,
              maxWidth,
              pointerEvents: interactive ? 'box-none' : 'none',
              opacity: panelSize === null ? 0 : 1,
            }}
          >
            {interactive && (
              // Only the two outer sides have a border; the inner half blends into the panel.
              <View
                className={`border-border bg-background absolute ${below ? 'border-l border-t' : 'border-b border-r'}`}
                style={{
                  pointerEvents: 'none',
                  width: ARROW_SIZE,
                  height: ARROW_SIZE,
                  left: arrowLeft,
                  [below ? 'top' : 'bottom']: -ARROW_SIZE / 2,
                  transform: [{ rotate: '45deg' }],
                }}
              />
            )}
            <TextRoot>
              {bare && panel}
              {!bare && (
                <TextStyle className={interactive ? 'text-ink' : 'text-ink-card text-xs'}>
                  {panel}
                </TextStyle>
              )}
            </TextRoot>
          </View>
        </Pressable>
      </Modal>
    </>
  );
}
