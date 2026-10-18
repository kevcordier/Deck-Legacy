import { appServices } from './appServices';
import { AppServicesContext } from '@contexts/AppServicesContext';
import type { ReactNode } from 'react';

/** Provides the app's services to the UI (`useAppServices`). */
export function AppServicesProvider({ children }: { readonly children: ReactNode }) {
  return <AppServicesContext value={appServices}>{children}</AppServicesContext>;
}
