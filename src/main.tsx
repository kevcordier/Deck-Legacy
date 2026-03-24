import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './i18n/i18n';
import App from './App.tsx';

createRoot(document.getElementById('root') as HTMLElement).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
