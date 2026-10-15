import background from '@assets/background.jpg';

/** Background image of the home and game pages, shown under a translucent `bg-background/80` layer. */
export const PAGE_BACKGROUND = background;

/** `imageStyle` of the background: an inline style, because react-native-web otherwise sizes it to the image's pixels. */
export const FULL_SIZE = { width: '100%', height: '100%' } as const;

/** Safe area edges of the page `SafeAreaView`: the top inset belongs to `Header`, so the status bar area matches it. */
export const PAGE_EDGES = ['right', 'bottom', 'left'] as const;
