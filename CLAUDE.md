# Deck-Legacy

Guide for anyone (human or AI) working on this repository. App-specific guides load when you work in their folder: [`apps/client/CLAUDE.md`](apps/client/CLAUDE.md) (Expo app) and [`apps/server/CLAUDE.md`](apps/server/CLAUDE.md) (API). The detailed engine and card reference is in [`.claude/rules/engine-reference.md`](.claude/rules/engine-reference.md) and loads when you work in `packages/engine` or `packages/game-data`.

---

## 1. Why

Deck-Legacy turns an existing solo legacy deck-building board game into a free digital game for the web, iOS and Android, so it can be played anywhere without setup or bookkeeping and shared with other players. It is a personal, non-commercial project and a playground for learning React Native, NestJS, event sourcing and AI-assisted development.

## 2. What

**The game.** Single-player deck-builder with a medieval theme: each round adds cards to the deck, cards evolve through states (Wild Grass → Plains → Farmlands), the player manages six resources and maximises Glory over a campaign with expansions. English and French, tutorial, unlimited undo. Rules: `apps/client/src/data/locales/rules.{en,fr}.md`.

**What it delivers.**

- Web version, public, on GitHub Pages: <https://kevcordier.github.io/Deck-Legacy/>
- iOS and Android builds through Expo, for development and personal use (no store release).
- An API for optional accounts: cross-device sync and leaderboard. The game never needs it to play.

**Status.** `1.0.0-beta.10`. Version `1.0.0` ships once the base game works well and the expansion mechanism is reliable; the missing expansions then arrive in minor versions (`1.x.0`) (EDR-049). The migration from the former Vite web app to the Expo monorepo is in progress (`chore/react-native-version`).

**Layout.**

```text
apps/client/          @deck-legacy/client — Expo / React Native app (runs the engine, saves locally, syncs)
apps/server/          @deck-legacy/server — NestJS API (verifies synced games by re-execution, stores them, scores); openapi.json = HTTP contract
packages/engine/      @deck-legacy/engine — pure game engine (domain = game rules, application = GameSession; EDR-058)
packages/game-data/   @deck-legacy/game-data — card definitions, stickers, deck.json, expansions/<name>/ (cards + deck.json)
.claude/              agents, contracts.md, memory/EDR.md (decisions), memory/INSIGHTS.md (lessons), rules, skills
scripts/dev.mjs       `pnpm dev` launcher; docker-compose.yml = local PostgreSQL
```

**Where things go.**

| To change…         | Edit…                                                                                                                            |
| ------------------ | -------------------------------------------------------------------------------------------------------------------------------- |
| A card             | `packages/game-data/src/cards/<id>.ts` + `src/locales/cards.{en,fr}.json` (skill `add-card`)                                     |
| An expansion card  | `packages/game-data/src/expansions/<name>/cards/<id>.ts` + its `deck.json` + its `locales/` (EDR-042, 043)                       |
| A card effect type | new strategy in `packages/engine/src/domain/cardAction/`, registered in `CardActionContext`                                      |
| A player action    | `GameCommand` → `GameSession.dispatch` → tests → client `GameProvider`                                                           |
| The UI             | `apps/client/src/presentation/components/<Component>/` + Storybook story                                                         |
| An API route       | Server DTO + controller, then `pnpm generate:api` (openapi.json + client types), then the client `infrastructure/api/` (EDR-056) |

## 3. How

**Setup.** Node 24.21.0 (`.nvmrc`), pnpm (pinned by `packageManager`; settings in `pnpm-workspace.yaml`, never `.npmrc`), Docker for the local database, a Supabase project for accounts. See `README.md`.

```bash
pnpm dev                 # API + Expo (w = web, i = iOS, a = Android)
pnpm dev:client          # Expo only (plays offline)
pnpm db:up / db:migrate  # local PostgreSQL / Prisma migration
pnpm test                # all unit tests (test:coverage with thresholds)
pnpm lint / typecheck / depcruise / format:check   # individual quality gates
pnpm verify              # format + lint:fix + typecheck + depcruise + test:coverage — run before every commit
pnpm build:packages      # rebuild shared packages (the server runs their dist/)
pnpm generate:api        # regenerate apps/server/openapi.json and the client API types
pnpm --filter <workspace> <script>   # one workspace: @deck-legacy/{client,server,engine,game-data}
```

**Git workflow.**

- Branch from `main` (`feat/…`, `fix/…`, `chore/…`) and open a PR to `main`. **Every merge requires the review and approval of the maintainer (@kevcordier)** and a green CI. Pushing a `v*` tag deploys the web client and the API (maintainer only). `master` is stale: never target it.
- One fix per commit. Conventional Commits with a scope: `fix(card-119): trigger at end of round`, `feat(engine): …`, `fix(client): …`, `chore(deps): …`.
- The pre-commit hook runs lint-staged, typecheck, depcruise and tests; `pnpm verify` also checks coverage.

**Code.**

- TypeScript strict; `import type` for types; `===`; `const`, never `var`; unused names prefixed `_`; no `console.log` (`warn`/`error` only); no `any` in engine logic (tolerated only for JSON casts).
- Functions that transform game state are pure and unit-tested.
- ESLint (`eslint.config.mjs`): zero warnings. Prettier sorts imports and Tailwind classes: never reorder by hand.
- Imports: engine by subpath (`@deck-legacy/engine/domain/types`); relative inside `packages/engine/src`; `@engine/*` in engine tests; aliases (`@components/*`…) in the client; relative in the server.

**Naming.**

- Card file `cards/<id>.ts` exporting a camelCase `CardDef`; state ids from 1; action ids `<cardId>-<stateId>-<n>`; effect ids numeric from 1. Ids are never renumbered.
- Illustrations `apps/client/assets/cards/<id>_<stateId>.jpg`, then `pnpm --filter @deck-legacy/client generate:illustrations`.
- One folder per component (`presentation/components/CardTrack/CardTrack.tsx`); strategies `<Name>Strategy.ts`; tests in `<workspace>/tests/**/*.test.ts`.
- **One public export per file** (class, function, component, hook or constant, plus its own types), named after it; only a file of related constants may export several. No `helpers/`, `utils/` or `common/` folders. Server files are kebab-case with their Nest role (`sync-game.use-case.ts`); client files are named like their export (`SyncService.ts`, `useGame.ts`, `slugify.ts`) (EDR-057).

**Tests.** Vitest. Coverage: engine 80 % everywhere; server 80 % (60 % branches). Every new function or branch in `packages/engine/src` is covered. Engine tests use minimal fixtures (`packages/engine/tests/application/fixtures.ts`, `…/session/fixtures.ts`), never real game data. A bug found while playing becomes a failing test before it is fixed (a `GameSession` scenario, or the event log from `GET /games/:id/export`). Cards with triggers or several states get a `GameSession` scenario test.

**Translations.** EN and FR always have the same keys: UI in `en.json`/`fr.json`, cards in `cards.{en,fr}.json` of `packages/game-data` (one pair for the base game, one per expansion folder), rules in `rules.{en,fr}.md`. In card texts, a resource amount of 3 or fewer repeats the icon (`{{gold}}{{gold}}`), 4 or more is written `4 {{gold}}` (checked by `packages/game-data/tests/locales.test.ts`). A new mechanic or icon ships with its explanation in the game and in the rules.

**UI.** Design for the phone first, then desktop; check every change at ≤ 375 px and ≥ 1024 px before committing; touch targets ≥ 44 pt, nothing hover-only. React Native primitives and NativeWind only (see `apps/client/CLAUDE.md`).

**Bug triage.** Most rule bugs are data errors: check the card definition field by field (cost resource, tags, trigger timing, glory sign, stay-in-play, upgrade target) before suspecting the engine. Card costs and selections use `board + permanents`, and intrinsic passives (`COUNT_AS_2`) as well as board effects.

**Documentation and memory.**

- A change of convention, format or structure updates the relevant `CLAUDE.md` in the same commit. When docs and code disagree, the code wins.
- Structural decisions: [`.claude/memory/EDR.md`](.claude/memory/EDR.md). Read it before proposing a structural change; record new decisions there. The clean architecture migration in progress (EDR-058) is planned in [`docs/clean-architecture-migration.md`](docs/clean-architecture-migration.md).
- Lessons learned: [`.claude/memory/INSIGHTS.md`](.claude/memory/INSIGHTS.md). Read the relevant entries before fixing a card, changing the UI or the CI.
- Known pitfalls: [`.claude/memory/FRICTIONS.md`](.claude/memory/FRICTIONS.md). Read it before touching the CI, the card model, expansions, sync or the architecture; never delete an entry.
- Claude Code subagents live in `.claude/agents/`; their ownership and validation rules are in [`.claude/contracts.md`](.claude/contracts.md).

## 4. Non-negotiable rules

Never:

1. **Mutate `GameState`.** Every change is a new `GameEvent` replayed by `GameAggregate`.
2. **Put game logic outside `packages/engine`** (React components, hooks, NestJS services).
3. **Break the replay of existing games.** No renumbered or removed ids, old events stay handled, randomness is stored in events. An incompatible card or rule change keeps the old behaviour for games already started (EDR-036).
4. **Make playing depend on the network.** The game must stay fully playable offline.
5. **Trust the client for scores.** Score, finished flag and campaign scores come from the server replay.
6. **Use browser APIs in `packages/`** or DOM elements in the client; never import client ↔ server or `packages` → `apps`.
7. **Invent a game rule** or interpret an ambiguous card text: ask.
8. **Bypass a quality gate:** no `--no-verify`, no lowered coverage threshold, no disabled lint rule, no remaining warning.
9. **Merge into `main` without the maintainer's review and approval**, push directly to `main` (except the maintainer's release commit and tag, via the `release` skill), rewrite shared history, or deploy / run `prisma:deploy` without the maintainer's approval.
10. **Edit an applied Prisma migration**; add a new one.
11. **Commit secrets** (`.env`) or assets without clear rights: illustrations are AI-generated or royalty-free only.
12. **Monetise the game or publish it to an app store** without a new decision (the rules are adapted from an existing game).
13. **Delete an entry from `EDR.md` or `INSIGHTS.md`**, or silently contradict an active decision: supersede it with a new entry.

## 5. Architecture

Major decisions already taken (details and rejected alternatives in `.claude/memory/EDR.md`):

| Area          | Decision                                                                                                                                                                                                                                                             | EDR                |
| ------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------ |
| Play model    | Local-first: the client runs `GameSession` and saves on the device; online, it syncs the full event log                                                                                                                                                              | 024                |
| Validation    | The server runs the recorded player commands again from the game seed (`GameSession.verify()`) and refuses a log they do not produce; seedless older games are unverified; a sync starts from the state kept at the last round start                                 | 024, 051, 030, 052 |
| Game state    | Event sourcing; mid-action state (pending choices) lives in memory; the tutorial is a real game with a scripted first draw, saved only if the player keeps it                                                                                                        | 003, 040           |
| Cards         | Declarative `CardDef` data interpreted by a generic engine; one strategy per `ActionEffectType`                                                                                                                                                                      | 004, 007           |
| Compatibility | Started games keep their rules: versioned rules/data (mechanism still to build before the first breaking change)                                                                                                                                                     | 025, 036           |
| Layers        | Domain imports nothing; application imports domain only; packages never import apps; game-data imports only engine domain types and enums; server modules and client split into domain / application / infrastructure / presentation; enforced by dependency-cruiser | 014, 057           |
| Repository    | pnpm monorepo; packages export TS sources (`source` condition) and CommonJS `dist/` for the server runtime; client and server must run the same engine and game data                                                                                                 | 022                |
| Client        | Expo SDK 57 / React Native 0.86 + react-native-web; expo-router (`/`, `/game/{slug}-{id}`); NativeWind 4 (Tailwind v3 syntax); i18next EN/FR                                                                                                                         | 020, 021, 006, 038 |
| API           | NestJS 11 in CommonJS (v12 is ESM-only, incompatible with the engine); zod DTOs → Swagger `openapi.json` → generated client types                                                                                                                                    | 026, 056           |
| Data          | PostgreSQL + Prisma 7; events stored as `jsonb`, compared by content, never by serialised string                                                                                                                                                                     | 027                |
| Auth          | Supabase Auth; without an account, no session and no API call (local saves only); sync starts at sign-in or sign-up                                                                                                                                                  | 050, 030           |
| Sync          | Last writer wins per kingdom; a kingdom = one save, up to 10 per account and 1 without; per-game in-memory lock → a single API instance                                                                                                                              | 029, 038           |
| Hosting       | Web on GitHub Pages; API on Google Cloud Run (`max-instances=1`); database and auth on Supabase                                                                                                                                                                      | 011, 035           |
| Quality       | Husky pre-commit; CI: lint → typecheck → format → depcruise → tests with coverage → server build; SonarCloud; Dependabot                                                                                                                                             | 012, 015, 016      |
| Contribution  | Open to contributors; every PR merged into `main` is reviewed and approved by the maintainer                                                                                                                                                                         | 037                |
| AI workflow   | Specialised Claude Code subagents with file ownership and veto rules (`.claude/contracts.md`)                                                                                                                                                                        | 032                |
