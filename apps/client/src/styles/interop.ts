/**
 * Registers third-party components with NativeWind so they accept `className`.
 * Imported once at startup (App.tsx and the Storybook preview).
 */
import { Picker } from '@react-native-picker/picker';
import { LinearGradient } from 'expo-linear-gradient';
import { cssInterop } from 'nativewind';
import Animated from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';
import Svg from 'react-native-svg';

cssInterop(LinearGradient, { className: 'style' });
cssInterop(Animated.View, { className: 'style' });
cssInterop(Animated.Image, { className: 'style' });
cssInterop(Picker, { className: 'style' });
cssInterop(SafeAreaView, { className: 'style' });
cssInterop(Svg, {
  className: {
    target: 'style',
    nativeStyleToProp: { width: true, height: true, color: true },
  },
});
