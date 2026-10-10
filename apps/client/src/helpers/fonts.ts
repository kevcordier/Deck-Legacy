// Per-weight entry points: importing the package index would bundle every weight.
import { CinzelDecorative_700Bold } from '@expo-google-fonts/cinzel-decorative/700Bold';
import { Cinzel_600SemiBold } from '@expo-google-fonts/cinzel/600SemiBold';
import { EBGaramond_400Regular } from '@expo-google-fonts/eb-garamond/400Regular';
import { EBGaramond_400Regular_Italic } from '@expo-google-fonts/eb-garamond/400Regular_Italic';
import { EBGaramond_700Bold } from '@expo-google-fonts/eb-garamond/700Bold';
import { useFonts } from 'expo-font';

/**
 * Loads the game fonts. Family names match `fontFamily` in tailwind.config.js
 * (`font-display`, `font-deco`, `font-body`, `font-body-italic`, `font-body-bold`).
 */
export function useAppFonts(): boolean {
  const [loaded, error] = useFonts({
    Cinzel_600SemiBold,
    CinzelDecorative_700Bold,
    EBGaramond_400Regular,
    EBGaramond_400Regular_Italic,
    EBGaramond_700Bold,
  });
  if (error) console.warn('Unable to load fonts', error);
  // Render with system fonts rather than blocking the app if fonts fail to load.
  return loaded || error !== null;
}
