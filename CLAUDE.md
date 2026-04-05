# Deck-Legacy — AI Assistant Guide

A browser-based deck-building card game built with React 19, TypeScript, and Vite. All game logic runs client-side; there is no backend.

---

## Quick Reference

```bash
npm run dev            # Start dev server (hot reload)
npm run test           # Run all unit tests once
npm run test:watch     # Run tests in watch mode
npm run test:coverage  # Coverage report (engine layer)
npm run lint           # ESLint (zero warnings policy)
npm run lint:fix       # Auto-fix ESLint violations
npm run typecheck      # TypeScript check without emit
npm run format         # Prettier format src/
npm run format:check   # Verify formatting
npm run build          # Production build (tsc + vite)
npm run storybook      # Component explorer on :6006
```

**Node version:** v20.20.1 (see `.nvmrc`)

---

## Architecture

The codebase follows Clean Architecture / Domain-Driven Design, split into three explicit layers under `src/engine/`:

```
src/
├── engine/
│   ├── domain/          # Pure types, enums, interfaces — zero logic
│   ├── application/     # Use cases, business logic, orchestration
│   └── infrastructure/  # localStorage persistence, data loaders
├── components/          # React UI components (feature folders)
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

`src/engine/application/cardAction/` contains 10 strategies implementing `CardActionStrategy`:

- `AddResourceStrategy`, `AddStickerStrategy`, `BlockCardStrategy`, `ChooseStateStrategy`
- `DestroyCardStrategy`, `DiscardCardStrategy`, `PlayCardStrategy`, `UpgradeCardStrategy`
- `PlaceCardInDrawPileStrategy`, (context: `CardActionContext`)

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
- Barrel export via `index.ts`
- Co-located CSS: `ComponentName.css`
- Co-located tests if needed: `ComponentName.test.ts`

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
npm run test            # Run once
npm run test:watch      # Watch mode
npm run test:coverage   # Coverage report
```

18 test files cover:

- All 10 card action strategies
- Core helpers: `cardHelpers`, `cardSelector`, `costResolver`, `effectResolver`, `factory`, `gameStateHelper`, `resourceHelpers`
- `GameAggregate`

**When adding new engine logic:** always add corresponding unit tests. Keep tests isolated — construct minimal `GameState`/`CardDef` fixtures rather than importing real game data.

---

## Code Quality Gates

A **pre-commit hook** (`.githooks/pre-commit`) blocks commits if any of these fail:

1. Prettier format check on staged `.ts`/`.tsx`
2. ESLint (zero warnings)
3. Full TypeScript type check
4. Full test suite

CI (`.github/workflows/deploy.yml`) also runs lint → typecheck → format check → tests before deploying to GitHub Pages.

Fix all issues before committing; do not use `--no-verify`.

---

## Internationalization

- Library: i18next + react-i18next
- Languages: English (`en`) and French (`fr`)
- UI strings: `src/i18n/locales/en.json`, `src/i18n/locales/fr.json`
- Card text: `src/i18n/locales/cards.en.json`, `src/i18n/locales/cards.fr.json`
- Language preference persisted to `localStorage` key `deck_legacy_lang`
- When adding new UI strings, add to **both** locale files. Card name/description additions go in both `cards.*.json` files.

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
npm run storybook       # Dev server on :6006
npm run build-storybook # Static build
```

---

## Common Pitfalls

- **Do not mutate `GameState`.** Create new events and let `GameAggregate` replay.
- **Do not import from Infrastructure in Application** — data loading goes through loaders called at startup.
- **All imports of types must use `import type`** — ESLint will fail otherwise.
- **The tsconfig excludes 4 files from typecheck** (`cardActions`, `turnFlow`, `choices`, `eventBuilders`). Do not add more exclusions; fix type errors instead.
- **Zero-warning ESLint policy.** Warnings become failures in CI.
- **Test coverage is for `src/engine/`** — UI components are not currently covered; do not rely on coverage numbers for component code.
