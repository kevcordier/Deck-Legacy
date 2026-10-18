import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Toast from 'react-native-toast-message';

/** Toast kept below the status bar and the notch (the default offset ignores them). */
export function SafeAreaToast() {
  const { top } = useSafeAreaInsets();
  return <Toast topOffset={top + 16} />;
}
