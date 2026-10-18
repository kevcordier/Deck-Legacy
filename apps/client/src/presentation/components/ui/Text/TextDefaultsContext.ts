import { ROOT_DEFAULTS } from './textConstants';
import type { TextDefaults } from '@styles/text/TextDefaults';
import { createContext } from 'react';

export const TextDefaultsContext = createContext<TextDefaults>(ROOT_DEFAULTS);
