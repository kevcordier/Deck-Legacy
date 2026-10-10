import AsyncStorage from '@react-native-async-storage/async-storage';
import { config, isAuthConfigured } from '@services/config';
import { type SupabaseClient, createClient } from '@supabase/supabase-js';
import { Platform } from 'react-native';

let client: SupabaseClient | null = null;

/** Lazily created Supabase client; sessions persist in AsyncStorage (`localStorage` on web). */
export function getSupabase(): SupabaseClient {
  if (!isAuthConfigured) {
    throw new Error('Supabase is not configured: set EXPO_PUBLIC_SUPABASE_URL and _KEY');
  }
  client ??= createClient(config.supabaseUrl, config.supabaseKey, {
    auth: {
      storage: AsyncStorage,
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: Platform.OS === 'web',
    },
  });
  return client;
}
