import { kingdomStore } from './kingdomStore';
import { kingdomUseCases } from './kingdomUseCases';
import { syncService } from './syncService';
import type { AppServices } from '@contexts/AppServicesContext';
import { accessToken } from '@infrastructure/api/accessToken';
import { api } from '@infrastructure/api/api';
import { catalog } from '@infrastructure/catalog/catalog';
import { isAuthConfigured } from '@infrastructure/config/isAuthConfigured';
import { storagePreferences } from '@infrastructure/storage/storagePreferences';
import { SupabaseAuthGateway } from '@infrastructure/supabase/SupabaseAuthGateway';
import { toast } from '@infrastructure/toast/toast';

const auth = new SupabaseAuthGateway();
// API requests carry the session token; without Supabase there is no session (EDR-050).
if (isAuthConfigured) accessToken.provide(() => auth.accessToken());

/** The real implementations of the services the UI uses. */
export const appServices: AppServices = {
  catalog,
  kingdoms: kingdomStore,
  kingdomUseCases,
  sync: syncService,
  notifier: toast,
  preferences: storagePreferences,
  accountApi: api,
  auth,
};
