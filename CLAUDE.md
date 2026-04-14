# Deck-Legacy — AI Assistant Guide

A browser-based deck-building card game built with React 19, TypeScript, and Vite. All game logic runs client-side; there is no backend.

---

## Quick Reference

```bash
pnpm dev            # Start dev server (hot reload)
pnpm test           # Run all unit tests once
pnpm test:watch     # Run tests in watch mode
pnpm test:coverage  # Coverage report (engine layer)
pnpm lint           # ESLint (zero warnings policy)
pnpm lint:fix       # Auto-fix ESLint violations
pnpm typecheck      # TypeScript check without emit
pnpm format         # Prettier format src/
pnpm format:check   # Verify formatting
pnpm build          # Production build (tsc + vite)
pnpm storybook      # Component explorer on :6008
```

**Node version:** v20.20.1 (see `.nvmrc`)

---

## Architecture

The codebase follows Clean Architecture / Domain-Driven Design, split into three explicit layers under `src/engine/`:

```
src/
├── engine/              # Agnostic engine
│   ├── domain/          # Pure types, enums, interfaces — zero logic
│   ├── application/     # Use cases, business logic, orchestration
│   └── infrastructure/  # localStorage persistence, data loaders
├── components/          # React UI components (feature folders)
├── helpers/             # Helpers use in React
├── hooks/               # Custom React hooks
├── data/                # Static game data (cards, stickers, deck)
├── i18n/                # i18next setup + EN/FR locale files
└── styles/              # Global CSS
```

### Layer Rules

- **Domain** imports nothing from Application or Infrastructure.
- **Application** imports only from Domain.
- **Infrastructure** imports from both Domain and Application; never imported by Application.
- **Components/hooks** import from Application (via `useGame`) and Infrastructure loaders, never directly from Domain internals.

---

## Core Concepts

### Event Sourcing

The entire game state is derived by replaying an ordered list of `GameEvent` objects. `GameAggregate` (`src/engine/application/GameAggregate.ts`) holds the events and reconstructs `GameState` on demand.

- **Never mutate `GameState` directly.** Always dispatch a new event.
- Persistence (`src/engine/infrastructure/persistence.ts`) serializes/deserializes the event log to `localStorage` key `deck_legacy_save`.
- Undo (`rewindEvent`) pops the last event and replays the remainder.

### Key Domain Types (src/engine/domain/)

| Type              | Description                                                           |
| ----------------- | --------------------------------------------------------------------- |
| `CardDef`         | Static card template with states, productions, upgrade paths, effects |
| `CardInstance`    | Runtime card: `{id, cardId, stateId, stickers, trackProgress}`        |
| `GameState`       | Full snapshot: piles, board, instances, resources, trigger stack      |
| `GameEvent`       | Discriminated union of all recordable events                          |
| `PendingChoice`   | Prompt awaiting player input (card select, resource, state)           |
| `Action` / `Cost` | Effect definitions for card abilities                                 |
| `Resource`        | `{gold, wood, stone, iron, weapon, goods}`                            |
| `Sticker`         | Persistent card modifier (production bonus, glory, stay-in-play)      |

### Strategy Pattern (Card Actions)

`src/engine/application/cardAction/` contains 11 strategies implementing `CardActionStrategy`:

- `AddResourceStrategy`, `AddStickerStrategy`, `BlockCardStrategy`, `ChooseStateStrategy`
- `DestroyCardStrategy`, `DiscardCardStrategy`, `DiscoverCardStrategy`, `PlayCardStrategy`
- `UpgradeCardStrategy`, `PlaceCardInDrawPileStrategy` (context: `CardActionContext`)

When adding new action types, add a new strategy file and register it in `CardActionContext`.

### useGame Hook

`src/hooks/useGame.ts` is the single integration point between the engine and React UI. It exposes game state and ~15 action methods:

```typescript
startGame()  startRound()  startTurn()
resolveProduction(instanceId, chosenResource?)
resolveAction(instanceId, actionId)
resolveUpgrade(instanceId, chosenUpgradeTo?)
progress()  endTurnVoluntary()
resolvePlayerChoice(choice)
resolvePayCost(resolved)
skipTrigger(uuid)
rewindEvent()  canRewind()
```

---

## Directory Conventions

### Components

- Each component lives in its own subdirectory: `src/components/ComponentName/`
- Co-located tests if needed: `ComponentName.test.ts`
- Shared UI primitives live under `src/components/ui/` (Button, ButtonGroup, Divider, Glory, Icon, Modal, ResourceChoice, ResourcePill, Section, Stat, Title)

### Path Aliases (tsconfig.json)

| Alias           | Maps to            |
| --------------- | ------------------ |
| `@engine/*`     | `src/engine/*`     |
| `@components/*` | `src/components/*` |
| `@pages/*`      | `src/pages/*`      |
| `@data/*`       | `src/data/*`       |
| `@hooks/*`      | `src/hooks/*`      |
| `@helpers/*`    | `src/helpers/*`    |
| `@i18n/*`       | `src/i18n/*`       |
| `@styles/*`     | `src/styles/*`     |

Always use aliases, never relative `../../` chains across major directories.

---

## Styling

The project uses **Tailwind CSS v4** (via `@tailwindcss/vite`). All styling is done with utility classes directly in JSX.

- Single CSS entry point: `src/styles/game.css` — contains the `@import 'tailwindcss'` directive, the `@theme` block (brand colors, fonts, animations), dark mode variants, and a single `@utility scrollbar` helper.
- No per-component CSS files. Do not create `ComponentName.css` files.
- Custom design tokens (colors, fonts) are declared in the `@theme` block in `game.css` and are available as Tailwind utilities (e.g. `bg-background`, `text-primary`, `font-display`).
- Dark mode uses the `[data-theme=dark]` attribute selector via `@custom-variant dark`.
- `prettier-plugin-tailwindcss` auto-sorts class names on format — do not reorder manually.

---

## TypeScript Conventions

- **Strict mode on.** No implicit any, no unused locals/parameters.
- Use `import type` for type-only imports (ESLint enforces this).
- Prefer `const` over `let`; never use `var`.
- Use `===` strict equality throughout.
- No `console.log` — only `console.warn` / `console.error`.
- Functions that narrow/transform state must be pure and testable.
- The `@typescript-eslint/no-explicit-any` rule is **warn** (not error) to accommodate JSON data casts, but avoid it in engine logic.

---

## Testing

**Framework:** Vitest with v8 coverage  
**Test files:** `src/**/*.test.ts`  
**Coverage scope:** `src/engine/**/*.ts` (excluding `useGame.ts`, `index.ts`)

```bash
pnpm test            # Run once
pnpm test:watch      # Watch mode
pnpm test:coverage   # Coverage report
```

**When adding new engine logic:** always add corresponding unit tests. Keep tests isolated — construct minimal `GameState`/`CardDef` fixtures rather than importing real game data.

---

## Code Quality Gates

A **pre-commit hook** (Husky + lint-staged, `.husky/pre-commit`) blocks commits if any of these fail:

1. ESLint auto-fix + Prettier format on staged `.ts`/`.tsx`
2. Prettier format on staged `.css`/`.json`/`.md`/`.yaml`
3. Full TypeScript type check
4. Dependecy cruiser validation
5. Full test suite

CI (`.github/workflows/deploy.yml`) also runs lint → typecheck → format check → tests before deploying to GitHub Pages.

Use `pnpm verify` then fix all issues before committing; do not use `--no-verify`.

---

## Internationalization

- Library: i18next + react-i18next
- Languages: English (`en`) and French (`fr`)
- UI strings: `src/i18n/locales/en.json`, `src/i18n/locales/fr.json`
- Card text: `src/i18n/locales/cards.en.json`, `src/i18n/locales/cards.fr.json`
- Game rules: `src/i18n/locales/rules.en.md`, `src/i18n/locales/rules.fr.md` — Markdown files imported as raw strings by `RulesModal` and rendered with `react-markdown`. Icon placeholders (`{{gold}}`, `{{glory}}`, …) are replaced with inline SVG icons at render time.
- Language preference persisted to `localStorage` key `deck_legacy_lang`
- When adding new UI strings, add to **both** locale files. Card name/description additions go in both `cards.*.json` files.
- Keep locale files lean — only add keys that are actively used in the UI. Remove keys when their component is deleted or refactored away.

---

## Game Data

Static data lives in `src/data/`:

- `cards.ts` — `CardDef[]` array defining all cards (states, productions, upgrades, effects)
- `stickers.ts` — Sticker definitions (production bonuses, glory, stay-in-play)
- `deck.json` — Initial deck composition (card IDs + instance counts)

When adding or modifying cards, update the corresponding locale files (`cards.en.json`, `cards.fr.json`) for name and description strings.

---

## localStorage Keys

| Key                | Contents                         |
| ------------------ | -------------------------------- |
| `deck_legacy_save` | Serialized event log + timestamp |
| `deck_legacy_lang` | Language code (`en` or `fr`)     |

---

## Deployment

- **Target:** GitHub Pages at `https://[user].github.io/Deck-Legacy/`
- **Vite base path:** `/Deck-Legacy/` (set in `vite.config.ts`)
- **Trigger:** Push to `main` branch or manual workflow dispatch
- **Pipeline:** CI passes → `dist/` built → uploaded to Pages artifact → deployed

Do not change the Vite base path without updating the GitHub Actions workflow.

---

## Storybook

Component stories live alongside components. Run with:

```bash
pnpm storybook       # Dev server on :6008
pnpm build-storybook # Static build
```

### Story conventions

- Stories are co-located next to their component: `ComponentName/ComponentName.stories.tsx`
- All shared UI primitives under `src/components/ui/` have stories (Button, ButtonGroup, Divider, Glory, Icon, Modal, ResourceChoice, ResourcePill, Section, Stat, Title).
- Feature components that require game context use `GameProvider` with `EMPTY_STATE` as a decorator or inside `render`.
- Use `title: 'UI/ComponentName'` for primitives and `title: 'Components/ComponentName'` for feature components.
- When adding a new UI primitive or feature component, add a corresponding `.stories.tsx` file.

---

## Common Pitfalls

- **Do not mutate `GameState`.** Create new events and let `GameAggregate` replay.
- **Do not import from Infrastructure in Application** — data loading goes through loaders called at startup.
- **All imports of types must use `import type`** — ESLint will fail otherwise.
- **The tsconfig excludes 4 files from typecheck** (`cardActions`, `turnFlow`, `choices`, `eventBuilders`). Do not add more exclusions; fix type errors instead.
- **Zero-warning ESLint policy.** Warnings become failures in CI.
- **Test coverage is for `src/engine/`** — UI components are not currently covered; do not rely on coverage numbers for component code.
- **Do not create per-component CSS files.** Styling is done exclusively with Tailwind utility classes. The only CSS file is `src/styles/game.css`.
- **Do not add unused i18n keys.** Both locale files must stay in sync and only contain keys actively used in the UI.
