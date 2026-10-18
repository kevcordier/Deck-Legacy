type TokenProvider = () => Promise<string | null>;

let provider: TokenProvider = () => Promise.resolve(null);

/** Supabase access token sent with every API request; `AuthProvider` sets where it comes from. */
export const accessToken = {
  provide(next: TokenProvider): void {
    provider = next;
  },
  get(): Promise<string | null> {
    return provider();
  },
};
