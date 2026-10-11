import { TutorialOverlay } from '@components/Tutorial/TutorialOverlay';
import { TutorialTarget } from '@components/Tutorial/TutorialTarget';
import { Button } from '@components/ui/Button/Button';
import { EyeIcon, EyeOffIcon } from '@components/ui/Icon/icon';
import { Text } from '@components/ui/Text/Text';
import { ModalDepthContext, TutorialContext } from '@contexts/TutorialContext';
import { useWebKeyDown } from '@hooks/useWebKeyDown';
import { type ReactNode, use, useCallback, useEffect, useRef, useState } from 'react';
import { Pressable, Modal as RNModal, ScrollView, View, type ViewStyle } from 'react-native';
import Animated, { SlideInLeft, SlideInRight } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Toast from 'react-native-toast-message';

export type ModalProps = {
  readonly title?: ReactNode;
  readonly subtitle?: ReactNode | null;
  readonly children: React.ReactNode;
  readonly onClose?: () => void;
  /** Extra classes for the modal panel. */
  readonly className?: string;
  /** Content displayed below the scrollable area (e.g. confirm buttons). */
  readonly footer?: ReactNode;
  readonly peeking?: boolean;
  readonly onPeekToggle?: () => void;
  /** Used to build the tutorial target ids `modal-<label>-panel` / `-close` / `-content`. */
  readonly label?: string;
  /** No panel: the content floats over a light backdrop (e.g. a card shown in large). A tap outside closes it. */
  readonly bare?: boolean;
  /** Full-height side panel sliding in from this edge, instead of a centred panel. */
  readonly side?: 'left' | 'right';
};

const PEEK_BUTTON_CLASS = 'absolute right-4 top-12 size-10';

const SLIDE_DURATION_MS = 250;
const SLIDE_IN = {
  left: SlideInLeft.duration(SLIDE_DURATION_MS),
  right: SlideInRight.duration(SLIDE_DURATION_MS),
};

function panelClass(side?: 'left' | 'right'): string {
  const drawer =
    'bg-background border-border absolute inset-y-0 w-[95%] max-w-5xl gap-6 p-4 lg:p-6';
  if (side === 'left') return `${drawer} left-0 rounded-r-2xl border-r`;
  if (side === 'right') return `${drawer} right-0 rounded-l-2xl border-l`;
  return 'bg-background border-border max-h-[90%] w-[95%] gap-6 rounded-2xl border p-4 lg:max-h-[80%] lg:w-auto lg:min-w-[32rem] lg:max-w-[80%] lg:p-6';
}

type ModalHeaderProps = Pick<ModalProps, 'title' | 'subtitle' | 'onClose' | 'label'>;

function ModalHeader({ title, subtitle, onClose, label }: ModalHeaderProps) {
  return (
    <View className="w-full flex-row items-start justify-between gap-4">
      <View className="shrink">
        {title !== undefined && title !== '' && (
          <Text className="text-primary font-body-bold uppercase">{title}</Text>
        )}
        {subtitle && <Text className="text-sm">{subtitle}</Text>}
      </View>
      {onClose && (
        <TutorialTarget id={label ? `modal-${label}-close` : undefined}>
          <Button onPress={onClose} variant="text" color="ink" size="sm" accessibilityLabel="Close">
            ✕
          </Button>
        </TutorialTarget>
      )}
    </View>
  );
}

function PeekButton({
  peeking,
  onPress,
  style,
}: {
  readonly peeking: boolean;
  readonly onPress: () => void;
  readonly style?: ViewStyle;
}) {
  return (
    <Pressable
      onPress={onPress}
      style={style}
      className="bg-background border-border absolute right-4 top-12 z-50 size-10 items-center justify-center rounded-full border shadow-md active:opacity-80"
      accessibilityRole="button"
      accessibilityLabel={peeking ? 'Afficher la modale' : 'Masquer la modale'}
    >
      {peeking ? <EyeOffIcon className="size-5" /> : <EyeIcon className="size-5" />}
    </Pressable>
  );
}

export function Modal({
  title,
  subtitle,
  children,
  onClose,
  className = '',
  footer,
  peeking = false,
  onPeekToggle,
  label,
  bare = false,
  side,
}: ModalProps) {
  const insets = useSafeAreaInsets();
  const tutorial = use(TutorialContext);
  const depth = use(ModalDepthContext) + 1;
  const registerModal = tutorial?.registerModal;

  useEffect(() => registerModal?.(depth), [registerModal, depth]);

  // The panel is positioned by its parent: a `TutorialTarget` wrapper would break its layout.
  const panelRef = useRef<View>(null);
  const panelId = label ? `modal-${label}-panel` : undefined;
  const registerTarget = tutorial?.registerTarget;
  const unregisterTarget = tutorial?.unregisterTarget;
  useEffect(() => {
    if (!panelId || !registerTarget || !unregisterTarget) return;
    registerTarget(panelId, panelRef);
    return () => unregisterTarget(panelId, panelRef);
  }, [panelId, registerTarget, unregisterTarget]);

  const handleKey = useCallback(
    (e: KeyboardEvent) => {
      if (e.key !== 'Escape') return;
      e.preventDefault();
      if (peeking) onPeekToggle?.();
      else onClose?.();
    },
    [onClose, onPeekToggle, peeking],
  );
  useWebKeyDown(handleKey);

  // The native modal covers the whole screen while the hidden state renders in the page: the
  // modal's button is placed where the page's one would be, so it does not jump on toggle.
  const peekAnchorRef = useRef<View>(null);
  const [peekPos, setPeekPos] = useState<ViewStyle | null>(null);
  const measurePeekAnchor = () =>
    peekAnchorRef.current?.measureInWindow((left, top) => setPeekPos({ top, left, right: 'auto' }));

  const peekButton = onPeekToggle && <PeekButton peeking={peeking} onPress={onPeekToggle} />;

  // Peeking: no native modal (it would capture every touch), so the page behind stays scrollable.
  // Only the button is rendered, without a full-screen wrapper: react-native-web drops an inline
  // `pointerEvents: 'box-none'`, so such a wrapper would block the page.
  if (peeking) return peekButton;

  return (
    <>
      {onPeekToggle && (
        <View
          ref={peekAnchorRef}
          collapsable={false}
          onLayout={measurePeekAnchor}
          style={{ pointerEvents: 'none' }}
          className={PEEK_BUTTON_CLASS}
        />
      )}
      <RNModal
        visible
        transparent
        animationType="fade"
        statusBarTranslucent
        navigationBarTranslucent
        onRequestClose={onClose}
      >
        <ModalDepthContext value={depth}>
          <View className="flex-1 items-center justify-center bg-black/60">
            <Pressable
              className="absolute inset-0"
              onPress={onClose}
              disabled={!onClose}
              // Without a panel, the backdrop is the only close control.
              accessibilityRole={bare ? 'button' : 'none'}
              accessibilityLabel={bare ? 'Close' : undefined}
              accessible={bare}
            />

            {bare ? (
              <View
                style={{ pointerEvents: 'box-none' }}
                className={`items-center gap-3 ${className}`}
              >
                {children}
              </View>
            ) : (
              <Animated.View
                ref={panelRef}
                collapsable={false}
                entering={side ? SLIDE_IN[side] : undefined}
                style={[
                  // The side panel runs under the status and navigation bars.
                  side && { paddingTop: insets.top + 16, paddingBottom: insets.bottom + 16 },
                ]}
                className={`${panelClass(side)} ${className}`}
              >
                <ModalHeader title={title} subtitle={subtitle} onClose={onClose} label={label} />

                <ScrollView className="w-full shrink" contentContainerClassName="gap-6 p-1">
                  <TutorialTarget
                    id={label ? `modal-${label}-content` : undefined}
                    className="gap-6"
                  >
                    {children}
                  </TutorialTarget>
                </ScrollView>

                {footer}
              </Animated.View>
            )}

            {onPeekToggle && peekPos && (
              <PeekButton peeking={false} onPress={onPeekToggle} style={peekPos} />
            )}

            <TutorialOverlay />
          </View>
          {/* Toasts must be rendered inside the native modal to appear above it. */}
          <Toast />
        </ModalDepthContext>
      </RNModal>
    </>
  );
}
