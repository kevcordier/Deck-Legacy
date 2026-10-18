import { TextDefaultsContext } from './TextDefaultsContext';
import type { TextDefaults } from '@styles/text/TextDefaults';
import { use } from 'react';

/** Default text color / font / size inherited by every `Text` rendered below. */
export function useTextDefaults(): TextDefaults {
  return use(TextDefaultsContext);
}
