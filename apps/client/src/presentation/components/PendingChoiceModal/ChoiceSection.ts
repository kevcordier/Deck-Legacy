import type { ReactNode } from 'react';

export type ChoiceSection = {
  title: string;
  subtitle: ReactNode;
  content: ReactNode;
  handleMultiConfirm?: () => void;
};
