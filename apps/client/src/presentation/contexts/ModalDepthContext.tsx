import { createContext } from 'react';

/** Nesting depth of the current modal (0 = app root). */
export const ModalDepthContext = createContext(0);
