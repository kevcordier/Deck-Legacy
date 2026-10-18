import { useIsDesktop } from '@hooks/useIsDesktop';
import { useWindowDimensions } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const CARD_ASPECT_RATIO = 3 / 5;

const MAX_CARD_WIDTH = 384;

/** Desktop: position line under the card and margins (px). */
const DESKTOP_CHROME_HEIGHT = 60;

/** Desktop: margins plus the previous / next buttons beside the card (px). */
const DESKTOP_CHROME_WIDTH = 130;

/** Phone: navigation row (buttons and position) under the card and margins (px). */
const PHONE_CHROME_HEIGHT = 90;

/** Phone: side margins only, the buttons are under the card (px). */
const PHONE_CHROME_WIDTH = 16;

/** Title line above the card and its gap (px). */
const TITLE_HEIGHT = 40;

/** Largest card width whose full height fits in the modal (mirrors the Modal max sizes). */
export function useViewerCardWidth(withTitle = false): number {
  const { width, height } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const isDesktop = useIsDesktop();
  const maxModalHeight = height * (isDesktop ? 0.8 : 0.9) - insets.top - insets.bottom;
  const availableHeight =
    maxModalHeight -
    (isDesktop ? DESKTOP_CHROME_HEIGHT : PHONE_CHROME_HEIGHT) -
    (withTitle ? TITLE_HEIGHT : 0);
  const availableWidth = width * 0.95 - (isDesktop ? DESKTOP_CHROME_WIDTH : PHONE_CHROME_WIDTH);
  return Math.max(
    0,
    Math.floor(Math.min(MAX_CARD_WIDTH, availableWidth, availableHeight * CARD_ASPECT_RATIO)),
  );
}
