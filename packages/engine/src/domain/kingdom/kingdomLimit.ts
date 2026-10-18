import { MAX_KINGDOMS_PER_ACCOUNT, MAX_KINGDOMS_PER_GUEST } from './kingdomConstants';

export function kingdomLimit(isAnonymous: boolean): number {
  return isAnonymous ? MAX_KINGDOMS_PER_GUEST : MAX_KINGDOMS_PER_ACCOUNT;
}
