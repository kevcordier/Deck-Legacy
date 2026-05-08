import App from './App.tsx';
import './helpers/i18n.ts';
import { createRoot } from 'react-dom/client';

createRoot(document.getElementById('root') as HTMLElement).render(<App />);
