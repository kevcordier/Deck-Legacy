import { AuthContext, type AuthContextType } from '@contexts/AuthContext';
import { use } from 'react';

export function useAuth(): AuthContextType {
  return use(AuthContext);
}
