/** Administration of the identity provider (Supabase Auth). */
export abstract class IdentityAdmin {
  /**
   * Deletes the user from the provider, so its tokens stop working. A user already gone is not
   * an error; a provider that refuses or is not configured throws an HTTP exception.
   */
  abstract deleteUser(userId: string): Promise<void>;
}
