import { ErrorBoundary } from '@components/ui/ErrorBoundary/ErrorBoundary';
import { SafeAreaToast } from '@components/ui/Modal/SafeAreaToast';
import { AppServicesProvider } from '@composition/AppServicesProvider';
import { bootstrapStorage } from '@composition/bootstrapStorage';
import { syncService } from '@composition/syncService';
import { AuthProvider } from '@contexts/AuthProvider';
import { GameUIProvider } from '@contexts/GameUIProvider';
import { useAppFonts } from '@hooks/useAppFonts';
import { useAuth } from '@hooks/useAuth';
import { isAuthConfigured } from '@infrastructure/config/isAuthConfigured';
import '@styles/global.css';
import '@styles/interop';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { type ReactNode, useEffect, useState } from 'react';
import { AppState } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';

void SplashScreen.preventAutoHideAsync();

/** Syncs the local kingdoms with the server for a registered account only (EDR-050). */
function AccountSync() {
  const { user } = useAuth();
  const userId = user && !user.isAnonymous ? user.id : null;

  useEffect(() => {
    syncService.setUser(userId);
    if (userId) void syncService.reconcile(userId);
  }, [userId]);

  // Back on the app: push local changes and pick up what other devices synced.
  useEffect(() => {
    const subscription = AppState.addEventListener('change', state => {
      if (state === 'active' && userId) void syncService.reconcile(userId);
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
      <AppServicesProvider>
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
      </AppServicesProvider>
      <SafeAreaToast />
    </SafeAreaProvider>
  );
}
