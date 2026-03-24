# Deck Legacy

Un jeu de cartes solo jouable dans le navigateur, construit avec React + TypeScript + Vite.

## Concept

Deck Legacy est un jeu de deckbuilding au tour par tour. Chaque manche, le joueur pioche des cartes, les active pour produire des ressources, déclenche des actions et fait évoluer son royaume. L'objectif est de maximiser ses **Points de Gloire** sur la durée de la partie.

### Mécaniques principales

- **Tableau** — les cartes jouées ce tour produisent des ressources et peuvent être activées une fois
- **Permanents** — cartes qui restent en jeu d'une manche à l'autre
- **Actions** — dépensent des ressources pour des effets variés (découverte, blocage, upgrade, piste d'avancée…)
- **Stickers** — bonus collés sur une carte, octroyant des effets passifs ou des points de gloire
- **Piste d'avancée** — certaines cartes progressent pas à pas vers des récompenses croissantes
- **Upgrade** — les cartes peuvent évoluer vers un état amélioré en payant un coût

## Structure du projet

```text
src/
├── engine/         # Logique de jeu (reducer événementiel, types, persistence)
├── components/     # UI React
│   ├── game/       # Composants spécifiques au jeu (aperçus, listes de cartes)
│   ├── layout/     # Composants de mise en page réutilisables
│   └── ui/         # Composants atomiques (boutons, pills, stats…)
├── data/           # Données JSON (cartes, stickers, deck)
└── i18n/           # Traductions (EN / FR)
```

## Démarrage

```bash
npm install
npm run dev
```

## Scripts disponibles

| Commande | Description |
| --- | --- |
| `npm run dev` | Serveur de développement Vite |
| `npm run build` | Build de production (TypeScript + Vite) |
| `npm run preview` | Prévisualiser le build |
| `npm run typecheck` | Vérification TypeScript sans build |
| `npm run lint` | ESLint sur `src/` |
| `npm run lint:fix` | ESLint avec corrections automatiques |
| `npm run format` | Formatage Prettier |
| `npm run format:check` | Vérification du formatage |

## Persistence

La partie en cours est sauvegardée automatiquement dans le `localStorage` sous la clé `deck_legacy_save`. La préférence de langue est mémorisée sous `deck_legacy_lang`.

## Stack

- **React 19** + **TypeScript**
- **Vite** (bundler)
- **i18next / react-i18next** (internationalisation EN/FR)
- **ESLint** + **Prettier**
