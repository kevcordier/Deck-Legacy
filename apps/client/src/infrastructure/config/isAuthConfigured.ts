import { config } from './config';

export const isAuthConfigured = config.supabaseUrl.length > 0 && config.supabaseKey.length > 0;
