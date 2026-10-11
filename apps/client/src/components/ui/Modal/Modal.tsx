import { TutorialOverlay } from '@components/Tutorial/TutorialOverlay';
import { TutorialTarget } from '@components/Tutorial/TutorialTarget';
import { Button } from '@components/ui/Button/Button';
import { EyeIcon, EyeOffIcon } from '@components/ui/Icon/icon';
import { Text } from '@components/ui/Text/Text';
import { ModalDepthContext, TutorialContext } from '@contexts/TutorialContext';
import { useWebKeyDown } from '@hooks/useWebKeyDown';
import { type ReactNode, use, useCallback, useEffect, useRef } from 'react';
import { Pressable, Modal as RNModal, ScrollView, View } from 'react-native';
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

function backdropClass(bare: boolean): string {
  return bare ? 'bg-black/40' : 'bg-black/60';
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

  const hiddenClass = peeking ? 'opacity-0' : '';

  return (
    <RNModal
      visible
      transparent
      animationType="fade"
      statusBarTranslucent
      navigationBarTranslucent
      onRequestClose={() => (peeking ? onPeekToggle?.() : onClose?.())}
    >
      <ModalDepthContext value={depth}>
        <View
          className={`flex-1 items-center justify-center ${peeking ? '' : backdropClass(bare)}`}
        >
          <Pressable
            className="absolute inset-0"
            onPress={onClose}
            disabled={!onClose || peeking}
            // Without a panel, the backdrop is the only close control.
            accessibilityRole={bare ? 'button' : 'none'}
            accessibilityLabel={bare ? 'Close' : undefined}
            accessible={bare}
          />

          {bare ? (
            <View
              style={{ pointerEvents: 'box-none' }}
              className={`items-center gap-3 ${hiddenClass} ${className}`}
            >
              {children}
            </View>
          ) : (
            <Animated.View
              ref={panelRef}
              collapsable={false}
              entering={side ? SLIDE_IN[side] : undefined}
              style={[
                { pointerEvents: peeking ? 'none' : 'auto' },
                // The side panel runs under the status and navigation bars.
                side && { paddingTop: insets.top + 16, paddingBottom: insets.bottom + 16 },
              ]}
              className={`${panelClass(side)} ${hiddenClass} ${className}`}
            >
              <ModalHeader title={title} subtitle={subtitle} onClose={onClose} label={label} />

              <ScrollView className="w-full shrink" contentContainerClassName="gap-6 p-1">
                <TutorialTarget id={label ? `modal-${label}-content` : undefined} className="gap-6">
                  {children}
                </TutorialTarget>
              </ScrollView>

              {footer}
            </Animated.View>
          )}

          {onPeekToggle && (
            <Pressable
              onPress={onPeekToggle}
              className="bg-background border-border absolute right-4 top-12 size-10 items-center justify-center rounded-full border shadow-md active:opacity-80"
              accessibilityRole="button"
              accessibilityLabel={peeking ? 'Afficher la modale' : 'Masquer la modale'}
            >
              {peeking ? <EyeOffIcon className="size-5" /> : <EyeIcon className="size-5" />}
            </Pressable>
          )}

          <TutorialOverlay />
        </View>
        {/* Toasts must be rendered inside the native modal to appear above it. */}
        <Toast />
      </ModalDepthContext>
    </RNModal>
  );
}
