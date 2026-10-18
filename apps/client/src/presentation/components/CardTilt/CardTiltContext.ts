import type { CardTiltValues } from './CardTiltValues';
import { createContext } from 'react';

export const CardTiltContext = createContext<CardTiltValues | null>(null);
