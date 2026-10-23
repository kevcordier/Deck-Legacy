import { type ReactNode, createContext } from 'react';

/** Page header kept above every modal (e.g. so undo stays reachable during a choice). */
export const ModalHeaderContext = createContext<ReactNode>(null);
