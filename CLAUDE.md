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

```text
src/
├── engine/              # Agnostic engine
│   ├── domain/          # Pure types, enums, interfaces — zero logic
│   ├── application/     # Use cases, business logic, orchestration
│   └── infrastructure/  # localStorage persistence, data loaders
├── components/          # React UI components (feature folders)
├── contexts/            # React contexts (GameContext, GameProvider, GameUIContext, GameUIProvider)
├── helpers/             # Helpers used in React
├── hooks/               # Custom React hooks
├── data/                # Static game data
│   ├── cards/           # One file per card (1.ts … N.ts) + index.ts
│   ├── stickers/        # One file per sticker (1.ts … N.ts) + index.ts
│   ├── deck.json        # Initial deck composition
│   ├── stickerStock.json# Initial sticker stock
│   └── locales/         # EN/FR locale files
└── styles/              # Global CSS
stories/                 # Storybook stories (top-level, outside src/)
├── ui/                  # Stories for src/components/ui/ primitives
├── pages/               # Stories for page-level components
└── tokens/              # Color & Typography MDX docs
tests/                   # Unit tests (top-level, outside src/)
└── engine/
    └── application/     # Tests for the engine application layer
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

### Card Structure

A card is defined by a `CardDef` object. Each card has one or more `CardState`s — the current state determines what the card produces and what actions it exposes.

```typescript
CardDef {
  id: number              // unique card identifier
  name: string            // visual name of the card (not use in code, local string use instead)
  chooseState?: number[]  // explicit list of state ids available at discovery time
  parchmentCard?: boolean // special UI rendering at discovery time and destroyed after its effect
  states: CardState[]
}

CardState {
  id: number                  // unique state identifier
  name: string                // visual name of the state (not use in code, local string use instead)
  permanent?: boolean         // stays on board instead of going to discard at the end of turn
  chooseName?: boolean        // if true, the player can choose a name on the card
  tags?: CardTag[]            // ARTIFACT | LAND | BUILDING | PERSON | EVENT | ENEMY | SEAFARING |
                              // GOAL | KNIGHT | ELDER | WALL | STATE | SHIP | ITEM | INVENTION |
                              // POTION | LOOT | LIVESTOCK | HORSE | LADY
  negative?: boolean          // define if a card is an enemy
  productions?: Resources[]   // resources generated on production action
  glory?: GloryDef            // glory point definition (amount, condition, valuePerElement…)
  actions?: CardAction[]      // list of state activations
  passives?: Passive[]        // list of state passive effects
  upgrade?: UpgradeDef[]      // paths to evolve this state into another
  track?: TrackDef            // optional multi-step track
  illustration?: string       // url or path to background image of the state
  description?: boolean       // if true, the card has a description text displayed in the UI
}

CardAction {
  id: string                // unique action identifier structured as cardID_stateId_id
  actionEffects: ActionEffect[]  // list of atomic effects to resolve
  unlimited?: boolean       // action can be used any number of times per turn
  limitedTime?: number      // max number of uses for this action
  cost?: Cost               // resource or card cost to pay
  endsTurn?: boolean        // if true then ends turn after this action resolution
  trigger?: Trigger         // fired automatically on the given trigger
  optional?: boolean        // only for trigger effects — allows skipping the trigger
}

ActionEffect {
  id: number                    // unique action effect identifier
  type: ActionEffectType        // ADD_RESOURCES | REMOVE_RESOURCE_ON_CARD | DISCARD_CARD |
                                // DISCOVER_CARD | DESTROY_CARD | UPGRADE_CARD | PLACE_CARD_IN_PILE |
                                // BLOCK_CARD | PLAY_CARD | ADD_STICKER | CHOOSE_STATE | BOOST_CARD |
                                // COST | ADD_CUMULATED | SET_CUMULATED | TRACK_ADVANCE |
                                // ADD_BOARD_EFFECT | CHOOSE_EFFECT | END_GAME | SHUFFLE_DECK | ADD_GLORY
  cards?: CardSelector          // target card filter (scope, tags, ids…)
  resources?: ResourceSelector  // target resource filter
  states?: StateSelector        // state ids choice
  stickers?: StickerSelector    // sticker ids choice
  value?: number                // generic numeric value
  position?: number | 'top' | 'bottom'  // position in pile for PLACE_CARD_IN_PILE
  effect?: Passive              // passive effect for ADD_BOARD_EFFECT
  effects?: ActionEffect[]      // nested effects for CHOOSE_EFFECT
  steps?: { pickNumber?: number; pickMin?: number; pickMax?: number }
}

TrackDef {
  steps: StepDef[]        // ordered list of steps
  inOrder: boolean        // must be accessed sequentially
  vertical?: boolean      // display flag
  inverse?: boolean       // progress from last to first
}

StepDef {
  id: number                // unique step identifier
  cost?: Cost               // resource or card cost to pay to access this step
  effects?: ActionEffect[]  // effects of this step
  icon?: string             // optional icon for display
}
```

### GameState Structure

`GameState` is a pure snapshot rebuilt by replaying all `GameEvent`s. Never mutate it directly — dispatch an event and let `GameAggregate` reconstruct the state.

```typescript
GameState {
  // Piles — arrays of CardInstance IDs
  drawPile:       number[]   // cards to be drawn this round
  discoveryPile:  number[]   // cards available for discovery
  discardPile:    number[]   // cards discarded after play
  destroyedPile:  number[]   // permanently removed cards
  board:          number[]   // cards in play this turn
  permanents:     number[]   // cards that stay on board across turns

  // Card runtime data
  instances: Record<number, CardInstance>  // all live instances keyed by instance ID

  // Economy
  resources:    Resources      // Partial<Record<ResourceType, number>> — current player resources
  stickerStock: StickerStock   // Record<number, number> — available sticker counts by sticker ID

  // Effects
  boardEffects:  Record<number, Passive[]>      // passive effects on board, keyed by instance ID
  triggerPile:   Record<string, TriggerEntry>   // pending triggers awaiting resolution
  lastAddedIds:  number[]                       // instance IDs added last (discovery, etc.)

  // Turn tracking
  round: number
  turn:  number
  phase: Phase  // PREGAME | START_ROUND | PLAYING | END_TURN | GAME_OVER
}

CardInstance {
  id:            number                     // unique runtime ID
  cardId:        number                     // references CardDef.id
  stateId:       number                     // current CardState.id
  stickers:      Record<number, number[]>   // stickers[stateId] = [stickerId, …]
  trackProgress: number[]                   // IDs of validated track steps
}

TriggerEntry {
  effectDef:        CardAction   // the action to fire
  sourceInstanceId: number       // instance that owns the trigger
}
```

**Phase transitions:**

```text
PREGAME → START_ROUND → PLAYING → END_TURN → START_ROUND → … → GAME_OVER
```

- `PREGAME` — initial state before the first round.
- `START_ROUND` — new cards added to discovery pile; player starts a round.
- `PLAYING` — active turn: cards are drawn and resolved.
- `END_TURN` — pending triggers resolved; board cleared.
- `GAME_OVER` — all rounds completed.

### Strategy Pattern (Card Actions)

`src/engine/application/cardAction/` contains 18 strategies implementing `CardActionStrategy`:

- `AddResourceStrategy`, `AddStickerStrategy`, `AddBoardEffectStrategy`, `AddCumulatedStrategy`
- `AddGloryStrategy`, `BlockCardStrategy`, `ChoseStateStrategy`, `DestroyCardStrategy`
- `DiscardCardStrategy`, `DiscoverCardStrategy`, `EndGameStrategy`, `PlaceCardInDrawPileStrategy`
- `PlayCardStrategy`, `RemoveResourceOnCardStrategy`, `SetCumulatedStrategy`, `ShuffleDeckStrategy`
- `TrackAdvanceStrategy`, `UpgradeCardStrategy` (context: `CardActionContext`)

When adding new action types, add a new strategy file and register it in `CardActionContext`.

### useGame Hook

`src/hooks/useGame.ts` is the single integration point between the engine and React UI. It exposes game state and ~15 action methods:

```typescript
startGame()  startRound()  startTurn()
resolveProduction(instanceId, chosenResource?)
resolveAction(instanceId, actionId)
resolveUpgrade(instanceId, chosenUpgradeTo?)
progress()  endTurnVoluntary()
resolvePlayerChoice(choice, choiceType)
resolvePayCost(resolved)
skipTrigger(uuid)
rewindEvent()  canRewind()
```

---

## Directory Conventions

### Components

- Each component lives in its own subdirectory: `src/components/ComponentName/`
- Shared UI primitives live under `src/components/ui/` (Button, ButtonGroup, Divider, EmptyState, Glory, Icon, GameOverScreen, MarkdownText, Modal, ResourceChoice, ResourcePill, Section, Stat, StickerChoice, Tag, Title)

### Path Aliases (tsconfig.json)

| Alias           | Maps to            |
| --------------- | ------------------ |
| `@engine/*`     | `src/engine/*`     |
| `@components/*` | `src/components/*` |
| `@contexts/*`   | `src/contexts/*`   |
| `@pages/*`      | `src/pages/*`      |
| `@data/*`       | `src/data/*`       |
| `@hooks/*`      | `src/hooks/*`      |
| `@helpers/*`    | `src/helpers/*`    |
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

## Linting

ESLint config: `eslint.config.js` (flat config format).

**Active plugin sets:**

| Plugin                        | Ruleset                  |
| ----------------------------- | ------------------------ |
| `@eslint/js`                  | `recommended`            |
| `typescript-eslint`           | `strict`                 |
| `eslint-plugin-sonarjs`       | `recommended`            |
| `@eslint-react/eslint-plugin` | `recommended-typescript` |
| `eslint-plugin-jsx-a11y`      | `strict`                 |
| `eslint-plugin-react-hooks`   | `recommended`            |
| `eslint-plugin-storybook`     | `flat/recommended`       |
| `eslint-plugin-prettier`      | formatting as errors     |

**Key rule overrides:**

| Rule                                         | Level | Note                                       |
| -------------------------------------------- | ----- | ------------------------------------------ |
| `@typescript-eslint/no-explicit-any`         | warn  | allowed for JSON casts only                |
| `@typescript-eslint/consistent-type-imports` | error | enforces `import type`                     |
| `@typescript-eslint/no-unused-vars`          | error | `_`-prefixed names ignored                 |
| `@typescript-eslint/no-non-null-assertion`   | warn  |                                            |
| `no-console`                                 | warn  | `console.warn` and `console.error` allowed |
| `prefer-const` / `no-var`                    | error |                                            |
| `eqeqeq`                                     | error | always strict equality                     |
| `object-shorthand`                           | error |                                            |
| `no-duplicate-imports`                       | error |                                            |
| `sonarjs/no-unused-vars`                     | off   | duplicate of TS rule                       |
| `sonarjs/todo-tag`                           | off   |                                            |
| `sonarjs/no-commented-code`                  | off   |                                            |

Zero-warning policy: all warnings are treated as failures in CI.

---

## Testing

**Framework:** Vitest with v8 coverage  
**Test files:** `tests/**/*.test.ts` (top-level directory, outside `src/`)  
**Coverage scope:** `src/engine/**/*.ts` — `src/engine/infrastructure` is **excluded**

```bash
pnpm test            # Run once
pnpm test:watch      # Watch mode
pnpm test:coverage   # Coverage report
```

**Coverage thresholds (enforced by Vitest):**

| Metric     | Threshold |
| ---------- | --------- |
| Lines      | 100 %     |
| Functions  | 100 %     |
| Branches   | 100 %     |
| Statements | 100 %     |

Every new function or branch added to `src/engine/application/` or `src/engine/domain/` must be fully covered. Tests must stay isolated — construct minimal `GameState`/`CardDef` fixtures; never import real game data.

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
- UI strings: `src/data/locales/en.json`, `src/data/locales/fr.json`
- Card text: `src/data/locales/cards.en.json`, `src/data/locales/cards.fr.json`
- Game rules: `src/data/locales/rules.en.md`, `src/data/locales/rules.fr.md` — Markdown files imported as raw strings by `RulesModal` and rendered with `react-markdown`. Icon placeholders (`{{gold}}`, `{{glory}}`, …) are replaced with inline SVG icons at render time.
- Language preference persisted to `localStorage` key `deck_legacy_lang`
- When adding new UI strings, add to **both** locale files. Card name/description additions go in both `cards.*.json` files.
- Keep locale files lean — only add keys that are actively used in the UI. Remove keys when their component is deleted or refactored away.

---

## Game Data

Static data lives in `src/data/`:

- `cards/` — One TypeScript file per card (`1.ts` … `N.ts`) + `index.ts` that re-exports the full `CardDef[]` array
- `stickers/` — One TypeScript file per sticker (`1.ts` … `N.ts`) + `index.ts`
- `deck.json` — Initial deck composition (card IDs + instance counts)
- `stickerStock.json` — Initial sticker stock available at game start

When adding a new card, create `src/data/cards/<id>.ts`, register it in `src/data/cards/index.ts`, and update both locale files (`cards.en.json`, `cards.fr.json`). Same pattern for stickers.

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

- Stories live in the top-level `stories/` directory, **not** co-located with components in `src/`.
- Structure mirrors the component hierarchy: `stories/ui/` for primitives, `stories/pages/` for page components, `stories/tokens/` for design token docs.
- Feature component stories sit directly under `stories/` (e.g. `stories/CardTrack.stories.tsx`).
- Feature components that require game context use `GameProvider` with `EMPTY_STATE` as a decorator or inside `render`.
- Use `title: 'UI/ComponentName'` for primitives and `title: 'Components/ComponentName'` for feature components.
- When adding a new UI primitive or feature component, add a corresponding `.stories.tsx` file in the appropriate `stories/` subdirectory.

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
