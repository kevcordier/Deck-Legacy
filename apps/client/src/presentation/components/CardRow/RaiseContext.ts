import { createContext } from 'react';

export const RaiseContext = createContext<(raised: boolean) => void>(() => {});
