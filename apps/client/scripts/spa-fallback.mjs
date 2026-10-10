// GitHub Pages serves 404.html for unknown paths: a copy of the single-page app lets deep links
// such as /Deck-Legacy/game/<slug>-<id> open the right route (expo-router reads the URL).
import { copyFileSync } from 'node:fs';
import path from 'node:path';

const dist = path.resolve(import.meta.dirname, '../dist');
copyFileSync(path.join(dist, 'index.html'), path.join(dist, '404.html'));
