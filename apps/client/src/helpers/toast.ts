import Toast from 'react-native-toast-message';

/** Thin wrapper around react-native-toast-message (replaces react-hot-toast). */
export const toast = {
  error(message: string) {
    Toast.show({ type: 'error', text1: message, position: 'top' });
  },
  info(message: string) {
    Toast.show({ type: 'info', text1: message, position: 'top' });
  },
  success(message: string) {
    Toast.show({ type: 'success', text1: message, position: 'top' });
  },
};
