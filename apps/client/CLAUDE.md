# Deck-Legacy Client — AI Assistant Guide

Expo SDK 57 / React Native 0.86 app (`@deck-legacy/client`) for iOS, Android and the web (react-native-web), styled with NativeWind 4. It **runs the game engine on the device** and saves locally, so the game plays offline. When a session exists, each game's event log is synced to the API in the background.

Repository-wide rules (engine, `GameSession`, layers, TypeScript, lint, quality gates) are in the [root `CLAUDE.md`](../../CLAUDE.md).

---

## Quick Reference

From the repository root:

```bash
pnpm dev                                         # API + Expo (w = web, i = iOS, a = Android)
pnpm dev:client                                  # Expo only (plays offline; sync needs the API)
pnpm --filter @deck-legacy/client storybook      # On-device Storybook (storybook:ios / :android / :web)
pnpm --filter @deck-legacy/client storybook:generate   # Regenerate .rnstorybook/storybook.requires.ts
pnpm --filter @deck-legacy/client generate:illustrations   # Regenerate src/data/illustrations.ts
pnpm --filter @deck-legacy/client test           # Client unit tests
pnpm build:client                                # Static web export to apps/client/dist
```

---

## Layout

```text
apps/client/
├── index.ts               # Entry point (expo-router, or Storybook when EXPO_PUBLIC_STORYBOOK_ENABLED=true)
├── assets/                # App icons + card illustrations (assets/cards, bundled for offline play)
├── scripts/               # generate-illustrations.mjs, spa-fallback.mjs (dist/404.html for deep links)
├── src/
│   ├── app/               # expo-router routes: _layout.tsx (storage, fonts, i18n, auth, sync), index.tsx (home), game/[kingdom].tsx
│   ├── polyfills.ts       # crypto.randomUUID on Hermes (the engine needs it)
│   ├── components/        # React UI components (feature folders)
│   ├── contexts/          # Auth, Game, GameUI, Tutorial contexts + providers
│   ├── helpers/           # Helpers used in React (catalog, i18n, illustrations…)
│   ├── hooks/             # useGame, useAuth, useSyncStatus, useGameUI…
│   ├── pages/             # Page components
│   ├── services/          # persistence.ts (local save), sync.ts, api.ts, supabase.ts, config.ts, storage.ts
│   ├── styles/            # global.css (NativeWind) + interop.ts (cssInterop registrations)
│   └── data/              # locales/ (EN/FR UI strings, card texts, rules), illustrations.ts (GENERATED)
├── stories/               # Storybook stories (+ storyCatalog.ts)
├── .rnstorybook/          # Storybook config
└── tests/                 # Client unit tests (helpers, services)
```

---

## Playing and Syncing

### Startup and routes (`src/app/`, expo-router)

`_layout.tsx` hydrates the storage and the kingdom saves (`helpers/bootstrap.ts`, which also migrates the single save of older versions into a kingdom), loads fonts and i18n, then renders the pages **immediately**, whatever the network. In parallel, `AuthProvider` opens a Supabase session when it can; once a user is known, `reconcile()` aligns the local kingdoms with the server. It runs again when the app comes back to the foreground and every minute, so a kingdom played on another device is picked up.

- `/` — `pages/Home/Home.tsx`: without an account, a welcome screen (sign in, or play without an account, remembered in `deck_legacy_offline`); then the **kingdoms** table (`KingdomTable`: name, total, base game, each expansion played in order with its logo and cumulative score, delete) and "New kingdom" (`NewKingdomModal`: name, tutorial, rules). A kingdom is one save (EDR-038): up to 10 with an account, 1 without (`maxKingdoms`).
- `/game/{slug}-{id}` — `app/game/[kingdom].tsx`: opens the kingdom's save (only the trailing id of the URL counts, `kingdomIdFromParam`). A new kingdom starts its first game, or the tutorial when it was chosen. The page remounts with an info toast when the sync downloads a newer version of the kingdom, and shows a conflict modal (keep the online version or overwrite it) when both devices changed it. Unknown kingdoms redirect to `/`.
- Navigation uses the static `router` from `expo-router` (works outside a navigator, e.g. Storybook). Build paths with `kingdomPath()`.

### useGame Hook

`src/hooks/useGame.ts` reads `GameContext`, provided by `GameProvider` (`src/contexts/GameProvider.tsx`). The provider owns a `GameSession` from the engine: each action runs a `GameCommand` synchronously, publishes the new `GameView`, saves the event log locally when it changed and schedules a sync. Rule errors (`CommandError`) are shown as toasts.

```typescript
isTutorial  startGame()  continueGame()  endRound()  startRound()  startTurn()
resolveProduction(instanceId, choiceIndex)
resolveAction(instanceId, actionId, triggerId?)
resolveUpgrade(instanceId, upgradeTo?)
progress()  endTurnVoluntary()
resolvePlayerChoice(choice, choiceType)  resolvePayCost(resolved)
skipTrigger(uuid)  skipChoice()  dismissParchmentText()
rewindEvent()  canRewind()
continueCampaign()  selectExpansion(name)  selectPurgeCard(id)  selectPurgePermanent(id)  finalizePurge()
setCardName(instanceId, name)  getCardName(instanceId)
```

- Card definitions come from `catalog` (`src/helpers/catalog.ts`, bundled from `@deck-legacy/game-data`).
- The tutorial plays a scripted first round (`TUTORIAL_DRAW_ORDER`, steps in `TutorialProvider`, cards shown in large by `TutorialStage`). Its session is not saved until the end: `continueGame()` keeps it as the kingdom's game (replayed as a standard session), `startGame()` starts a new one.
- `GameProvider initialState={…}` renders a static board without a session (Storybook).
- Development builds (`__DEV__`) allow unrestricted rewind and the cheat panel (`globalThis.__cheat`). The server refuses cheated games unless it runs with `ALLOW_CHEATS=true`.

### Local save and sync

- `services/persistence.ts` — the kingdom index (`deck_legacy_kingdoms`: `{id, name, createdAt, summary}`, read with `useKingdoms()`) and one save per kingdom (`deck_legacy_save_<id>`: `{id, events, cardNames, savedAt, sync}`). The summary (score, ordered segments, finished) is computed on the device for the home page; server scores stay authoritative. `sync.dirty` marks changes the server has not accepted; `sync.userId` the account it was synced with; `sync.serverVersion` the server version it builds on; `sync.syncedUpTo` how many leading events the server already has (only the rest is pushed; a rewind lowers it); `sync.rejected` a save the server refused and `sync.limited` a kingdom refused by the kingdom limit (both retried after the next change); `sync.conflict` a push refused because another device synced first (not pushed until `resolveConflict`). Saves of older versions load as dirty and are uploaded.
- `services/sync.ts` — `scheduleSync()` (debounced push of every changed kingdom: the events after `syncedUpTo`, with `fromSeq` and `baseVersion`), `syncNow()`, `resolveConflict(id, 'server' | 'mine')`, and `reconcile(userId)` (single-flight, every minute and on foreground):
  - kingdoms synced with another account are removed from the device (their unsynced changes are lost);
  - unsynced local changes are pushed; if another device synced first (`409 STALE_VERSION`) the kingdom is in `conflict` and the player chooses — unless the server log only holds events this device already has (a push whose response was lost): the push then builds on the server version and is retried once;
  - the account's other kingdoms are downloaded (continue on another device), unless the player started playing during the download; synced kingdoms the server no longer has are removed.
- Deleting a kingdom removes it locally and records it in `deck_legacy_pending_abandons`, abandoned on the server at the next sync.
- `useSyncStatus()` exposes `signedOut | syncing | synced | pending | offline | rejected | limited | conflict` (shown in the account tab of `OptionsModal`).
- There is no JSON export/import any more (EDR-038).

### Authentication

`AuthProvider` opens a guest (anonymous) Supabase session on first launch and retries every 30 s while offline; it never blocks the game. Without Supabase configuration (`isAuthConfigured`), the app works offline-only and accounts are unavailable. `SignInForm` (home welcome screen and the account tab) has two tabs: sign in, or create an account from the guest account (`createAccount`: email and password in one `updateUser` call, then `refreshSession()` so the access token carries the email and `is_anonymous: false` — email confirmation is off — then the display name through `PATCH /me`). A new password (account creation, password change) must pass `checkPassword()` (`helpers/password.ts`: 8+ characters, lowercase, uppercase, digit) and be typed twice; `PasswordStrength` shows the meter and the rule checklist. Password fields use `PasswordInput` (`ui/Input`), which has a show/hide toggle. Sign-in still accepts 6+ characters for older accounts. `OptionsModal` has two tabs (`ui/Tabs`): general options (theme, language, back home) and, when accounts are available, `AccountPanel`, which edits the display name, changes the password, signs out and deletes the account (`DELETE /me`, then a new guest session), and shows the sync status; signing out or deleting the account closes the modal. The home page opens it on the account tab from its account button. `services/api.ts` sends the access token as `Authorization: Bearer`.

---

## Directory Conventions

### Components

- Each component lives in its own subdirectory: `apps/client/src/components/ComponentName/`
- Shared UI primitives live under `apps/client/src/components/ui/` (Button, ButtonGroup, Checkbox, Divider, EmptyState, ErrorBoundary, FadeInScale, Glory, Grid, HoverPressable, Icon, Input, GameOverScreen, MarkdownText, Modal, PasswordStrength, ResourceChoice, ResourcePill, Section, Stat, StickerChoice, StickerDisplay, Tabs, Tag, Text, Title, Tooltip)
- Only React Native primitives (`View`, `Pressable`, `ScrollView`, `Image`…) — never DOM elements (`div`, `span`, `button`…).
- Tutorial anchors are `<TutorialTarget id="…">` wrappers; the step list lives in `TutorialProvider`.

### Path Aliases (apps/client/tsconfig.json)

| Alias           | Maps to            |
| --------------- | ------------------ |
| `@components/*` | `src/components/*` |
| `@contexts/*`   | `src/contexts/*`   |
| `@data/*`       | `src/data/*`       |
| `@helpers/*`    | `src/helpers/*`    |
| `@hooks/*`      | `src/hooks/*`      |
| `@pages/*`      | `src/pages/*`      |
| `@services/*`   | `src/services/*`   |
| `@styles/*`     | `src/styles/*`     |
| `@assets/*`     | `assets/*`         |

Aliases are mirrored in `apps/client/vitest.config.mts` and the root `tsconfig.depcruise.json`. Always use aliases in the client, never relative `../../` chains across major directories.

---

## Styling

The client uses **NativeWind 4** (Tailwind CSS **v3** syntax for React Native). All styling is done with utility classes in `className`. Paths below are relative to `apps/client/`.

- `tailwind.config.js` holds the design tokens (colors, `font-display` / `font-deco` / `font-body` / `font-body-italic` / `font-body-bold`). Themed colors (`background`, `ink`, `border`, `primary`) are CSS variables declared in `src/styles/global.css` (`:root` / `.dark:root`), toggled via `colorScheme.set()` in `GameUIProvider`.
- `src/styles/global.css` is the only CSS file. Do not create per-component CSS files.
- Third-party components that must accept `className` are registered in `src/styles/interop.ts` (`cssInterop`).
- **Text styles do not cascade in React Native.** Every string must be rendered inside the `Text` primitive (`@components/ui/Text/Text`), which applies default `text-ink font-body text-base`. Use `<TextStyle className="…">` to set inherited text defaults for a subtree (like CSS inheritance). Content shown in a floating panel (tooltip) inherits from its trigger: wrap it in `<TextRoot>` to restart from the app defaults.
- Do not rely on class order to override a class of the same kind in one `className` string (NativeWind resolves conflicts by stylesheet order): expose a prop instead (see `Tag textClassName`, `GameCard unconstrained`).
- Not available in React Native: CSS grid (use `Grid`), container queries (measure with `onLayout`), `hover:` (use `active:`; for a hover effect on a control, `HoverPressable`), gradients (use `expo-linear-gradient`), `backdrop-blur`, `ring`.
- Desktop vs mobile layout: `useIsDesktop()` (≥ 1024px). Prefer not rendering a layout rather than hiding it with `hidden`.
- Class names must be complete literals in the source (no string concatenation of partial class names).
- `prettier-plugin-tailwindcss` auto-sorts class names on format — do not reorder manually.

---

## Internationalization

- Library: i18next + react-i18next
- Languages: English (`en`) and French (`fr`)
- UI strings: `src/data/locales/en.json`, `fr.json`
- Card text: the `cards` namespace comes from `cardTexts` in `@deck-legacy/game-data` (base game file plus one file per expansion, EDR-043)
- Game rules: `src/data/locales/rules.en.md`, `rules.fr.md` — Markdown files inlined as raw strings by `babel-plugin-inline-import` (relative import paths; their content is hashed into Metro's `cacheVersion` in `metro.config.js`, so restart Metro after editing them — no `--clear` needed) and rendered with `react-native-marked`. Icon placeholders (`{{gold}}`, `{{glory}}`, …) are replaced with inline SVG icons at render time.
- Language preference persisted to storage key `deck_legacy_lang` (i18n is initialised by `initI18n()` after storage hydration)
- When adding new UI strings, add to **both** locale files. Card texts go in both `cards.*.json` files of `packages/game-data`.
- Keep locale files lean — only add keys that are actively used in the UI. Remove keys when their component is deleted or refactored away.
- Engine rule errors (`CommandError.message`) are i18n keys: keep them in both locale files.

---

## Storage and Configuration

AsyncStorage (`localStorage` on web), keys declared in `STORAGE_KEYS` (`src/services/storage.ts`):

| Key                            | Contents                                               |
| ------------------------------ | ------------------------------------------------------ |
| `deck_legacy_kingdoms`         | Kingdom index: id, name, creation date, scores         |
| `deck_legacy_save_<id>`        | A kingdom's game: event log, card names, sync          |
| `deck_legacy_save`             | Single save of older versions (migrated, removed)      |
| `deck_legacy_offline`          | The player chose to play without an account            |
| `deck_legacy_pending_abandons` | Server games to abandon at the next sync               |
| `deck_legacy_lang`             | Language code (`en` or `fr`)                           |
| `deck_legacy_theme`            | `light`, `dark` or `system`                            |
| `deck_legacy_tutorial`         | Tutorial enabled (`true`/`false`)                      |
| `deck_legacy_resource_warning` | Warn before progressing with resources (`false` = off) |

Supabase stores its session in AsyncStorage as well.

`.env` (see `.env.example`), inlined at build time: `EXPO_PUBLIC_API_URL`, `EXPO_PUBLIC_SUPABASE_URL`, `EXPO_PUBLIC_SUPABASE_KEY` (publishable key — never a secret or `service_role` key). Leave the Supabase variables empty for an offline-only build.

---

## Deployment

- **Web:** GitHub Pages at `https://[user].github.io/Deck-Legacy/`, built with `pnpm build` (illustrations generation + `expo export --platform web`) into `dist/`, using the repository variables `API_URL`, `SUPABASE_URL`, `SUPABASE_PUBLISHABLE_KEY`.
- **Base path:** `/Deck-Legacy` (`expo.experiments.baseUrl` in `app.json`). Do not change it without updating the GitHub Actions workflow and the favicon link of `public/index.html` (the web HTML template: Metro's single output ignores `web.favicon`).
- **Home screen install:** `public/manifest.json` (standalone display, icons in `public/icons/`) and the `apple-*` tags of `public/index.html` (iOS ignores the manifest icons and uses `public/apple-touch-icon.png`, opaque because iOS fills transparency with black). Metro's single output generates none of them; keep their paths under the base path.
- **Deep links:** the build copies `dist/index.html` to `dist/404.html` (`scripts/spa-fallback.mjs`), so GitHub Pages serves the app for `/Deck-Legacy/game/…` and expo-router opens the route.
- **Mobile:** iOS/Android binaries are built with EAS or `npx expo run:ios|android` from `apps/client` (native folders are generated, not committed). The URL scheme is `decklegacy`.

---

## Storybook

Storybook for React Native (v10) runs inside the client app: `pnpm --filter @deck-legacy/client storybook` starts Expo with `EXPO_PUBLIC_STORYBOOK_ENABLED=true`, and `index.ts` renders `.rnstorybook` instead of the game. Stories use the bundled card data; no server is needed.

### Story conventions

- Stories live in `apps/client/stories/`, **not** co-located with components.
- Structure mirrors the component hierarchy: `stories/ui/` for primitives, `stories/pages/` for page components, `stories/tokens/` for design tokens.
- Feature components that require game context use `StoryProviders` (or `GameProvider initialState={…}`), which render a static board.
- Use `getStoryCatalog()` / `baseInstances()` / `makeInstance()` from `stories/storyCatalog.ts` for card data and instances.
- Use `title: 'UI/ComponentName'` for primitives and `title: 'Components/ComponentName'` for feature components.
- `.rnstorybook/storybook.requires.ts` is generated — do not edit it.
- When adding a new UI primitive or feature component, add a corresponding `.stories.tsx` file.

---

## Common Pitfalls

- **Never render a raw string outside `Text`** — it crashes on iOS/Android even though it works on web.
- **No DOM / browser APIs in shared code** (`document`, `window`, `localStorage`, `crypto.randomUUID`). Use `storage`, `expo-crypto`, `Platform.OS === 'web'` guards or `.web.ts` files (see `hooks/useWebKeyDown.ts`).
- **Do not create per-component CSS files.** The only CSS file is `src/styles/global.css`.
- **Nested pressables:** a card surface is a `Pressable` without `accessibilityRole="button"`, because on web a `button` role cannot contain other buttons.
- **Do not add unused i18n keys.** Both locale files must stay in sync and only contain keys actively used in the UI.
- **Card images are bundled**: add the file to `assets/cards/`, run `generate:illustrations`, and resolve it with `getIllustrationSource(path)`.
- **Never block the game on the network**: the save is local first; anything online (accounts, sync, scores) must degrade gracefully.
- **`react-native-reanimated-dnd` is patched** (`patches/`, `patchedDependencies` in `pnpm-workspace.yaml`): a dragged card takes the cell under its centre, not under its top-left corner, and its drag shadow uses `boxShadow` (the `shadow*` props are deprecated on web). Check the patch still applies (or is still needed) when upgrading the library; restart Metro with `--clear` after changing it.
- **Do not write `GameState` from components**: send a `GameCommand` through `useGame()`.
