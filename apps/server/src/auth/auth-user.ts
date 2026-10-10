/** Identity extracted from a verified Supabase access token. */
export type AuthUser = {
  id: string;
  email: string | null;
  isAnonymous: boolean;
};
