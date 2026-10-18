/** The signed-in player, as the identity provider describes them. */
export type AuthUser = {
  id: string;
  email: string | null;
  isAnonymous: boolean;
};
