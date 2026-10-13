import { ErrorBoundary } from '@components/ui/ErrorBoundary/ErrorBoundary';
import { AuthProvider } from '@contexts/AuthProvider';
import { GameUIProvider } from '@contexts/GameUIProvider';
import { bootstrapStorage } from '@helpers/bootstrap';
import { useAppFonts } from '@helpers/fonts';
import { useAuth } from '@hooks/useAuth';
import { isAuthConfigured } from '@services/config';
import { reconcile, setSyncUser } from '@services/sync';
import '@styles/global.css';
import '@styles/interop';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { type ReactNode, useEffect, useState } from 'react';
import { AppState } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import Toast from 'react-native-toast-message';

void SplashScreen.preventAutoHideAsync();

/** Syncs the local kingdoms with the server whenever a session exists. */
function AccountSync() {
  const { user } = useAuth();
  const userId = user?.id ?? null;

  useEffect(() => {
    setSyncUser(userId);
    if (userId) void reconcile(userId);
  }, [userId]);

  // Back on the app: push local changes and pick up what other devices synced.
  useEffect(() => {
    const subscription = AppState.addEventListener('change', state => {
      if (state === 'active' && userId) void reconcile(userId);
    });
    return () => subscription.remove();
  }, [userId]);

  return null;
}

function WithAuth({ children }: { readonly children: ReactNode }) {
  return isAuthConfigured ? <AuthProvider>{children}</AuthProvider> : children;
}

/** Root of every page: storage, fonts, i18n, auth, background sync. Plays without network. */
export default function RootLayout() {
  const [storageReady, setStorageReady] = useState(false);
  const fontsLoaded = useAppFonts();

  useEffect(() => {
    void bootstrapStorage().then(() => setStorageReady(true));
  }, []);

  const ready = storageReady && fontsLoaded;

  useEffect(() => {
    if (ready) void SplashScreen.hideAsync();
  }, [ready]);

  if (!ready) return null;

  return (
    <SafeAreaProvider>
      <StatusBar style="auto" />
      <ErrorBoundary>
        <WithAuth>
          <GameUIProvider>
            <AccountSync />
            <Stack screenOptions={{ headerShown: false }}>
              {/* The left edge swipe opens the draw pile there, not the iOS back gesture. */}
              <Stack.Screen name="game/[kingdom]" options={{ gestureEnabled: false }} />
            </Stack>
          </GameUIProvider>
        </WithAuth>
      </ErrorBoundary>
      <Toast />
    </SafeAreaProvider>
  );
}
