# Deck Legacy

[![Code quality checks and tests](https://github.com/kevcordier/Deck-Legacy/actions/workflows/ci.yml/badge.svg)](https://github.com/kevcordier/Deck-Legacy/actions/workflows/ci.yml)
[![Quality Gate Status](https://sonarcloud.io/api/project_badges/measure?project=kevcordier_Deck-Legacy&metric=alert_status)](https://sonarcloud.io/summary/new_code?id=kevcordier_Deck-Legacy)

A single-player deck-building card game for web, iOS and Android, with a medieval theme. Build and evolve your deck across multiple rounds, manage resources, and maximize your Glory score.

**[Play now](https://kevcordier.github.io/Deck-Legacy/)**

---

## Gameplay

Deck Legacy is a solitaire deck-builder with roguelike progression. Each round, new cards are added to your deck from a discovery pile. Cards can be upgraded through multiple states (e.g., Wild Grass → Plains → Farmlands), creating an ever-evolving engine.

### Core Mechanics

- **Rounds & Turns** — Each round adds new cards to your deck. Each turn, you draw and activate one card.
- **Resources** — Six resources drive your economy: Gold, Wood, Stone, Iron, Weapon, and Goods.
- **Production** — Cards generate resources automatically on play.
- **Effects** — Activated abilities with resource or discard costs.
- **Upgrades** — Spend resources to evolve cards into stronger states.
- **Discovery** — New cards appear in a discovery pile each round.
- **Stickers** — Persistent modifiers that add production bonuses or passive effects.
- **Buildings** — Permanent cards that stay on the board and provide Glory.
- **Undo** — Any action can be rewound (event-sourced game state).

### Victory

Maximize **Glory** points across all rounds by discovering, upgrading, and chaining cards into a powerful production engine.

---

## Getting Started

**Requirements:** Node.js v24 (see `.nvmrc`), pnpm (version pinned in `package.json`), Docker for the local database, and a [Supabase](https://supabase.com) project for authentication.

```bash
# Install dependencies for every workspace
pnpm install

# Start PostgreSQL and create the schema
pnpm db:up
cp apps/server/.env.example apps/server/.env   # then fill SUPABASE_URL
pnpm db:migrate

# Configure the client
cp apps/client/.env.example apps/client/.env   # API URL + Supabase URL and publishable key

# Start the API (port 3000) and the Expo dev server together
pnpm dev
```

In the Expo terminal, press `w` for the web version ([http://localhost:8081/Deck-Legacy/](http://localhost:8081/Deck-Legacy/)), `i` for the iOS simulator or `a` for Android. If port 8081 is busy, `pnpm dev` picks the next free one (or set `EXPO_PORT`).

### Available Scripts

Run from the repository root:

| Command               | Description                                           |
| --------------------- | ----------------------------------------------------- |
| `pnpm dev`            | API server and Expo dev server, with hot reload       |
| `pnpm dev:server`     | API server only                                       |
| `pnpm dev:client`     | Expo dev server only                                  |
| `pnpm db:up` / `down` | Start / stop the local PostgreSQL container           |
| `pnpm db:migrate`     | Apply Prisma migrations (development)                 |
| `pnpm build`          | Build every workspace (packages, server, web export)  |
| `pnpm test`           | Run all unit tests                                    |
| `pnpm test:coverage`  | Tests with coverage (engine and server thresholds)    |
| `pnpm lint`           | ESLint (zero-warning policy)                          |
| `pnpm typecheck`      | TypeScript check of every workspace                   |
| `pnpm format`         | Prettier                                              |
| `pnpm depcruise`      | Architecture rules (dependency-cruiser)               |
| `pnpm verify`         | Format, lint, typecheck, architecture rules and tests |

Storybook runs from the client: `pnpm --filter @deck-legacy/client storybook`.

The game is playable without the API or Supabase (offline, saved on the device); they are only needed for accounts, cross-device sync and the leaderboard.

---

## Tech Stack

- **pnpm workspaces** — one repository, two apps and two shared packages
- **React Native 0.86 + Expo SDK 57** — iOS, Android and web (react-native-web) from one codebase
- **NativeWind 4** — Tailwind CSS classes for React Native
- **NestJS 11** — API server: accounts, game sync (validated by replaying the engine), scores
- **PostgreSQL + Prisma 7** — users, game event logs and scores
- **Supabase Auth** — optional email accounts
- **TypeScript** — strict mode throughout
- **Vitest** — unit and end-to-end tests with v8 coverage
- **i18next** — internationalization (English & French)
- **Storybook for React Native 10** — on-device component explorer

---

## Architecture

```text
apps/
├── client/              # Expo app: game provider, local save + sync, components, stories, locales
│   └── assets/cards/    # Card illustrations (bundled for offline play)
└── server/              # NestJS API
    ├── src/games/       # Game sync: validation by replay, event store
    ├── src/auth/        # Supabase token verification (global guard)
    ├── src/users/       # Player profiles
    ├── src/scores/      # Final scores and leaderboard
    └── prisma/          # Database schema and migrations
packages/
├── engine/              # Game engine: domain (game rules, event sourcing) + application (GameSession)
├── game-data/           # Card, sticker and deck definitions
```

**Local-first** — The engine runs on the device: every action is executed locally and the event log is saved on the device, so the game works offline. When online, the log is synced to the server (`PUT /games/:id`), which replays it with the same engine to validate it, stores it in PostgreSQL and records final scores. A game can be resumed on another device signed in to the same account.

**Event Sourcing** — The game state is derived by replaying an ordered list of `GameEvent` objects. Nothing is mutated directly; undo pops the last event.

**Accounts** — Without an account, games are saved on the device only and the API is never called. Creating an account or signing in syncs the kingdoms across devices and ranks their final scores on the leaderboard.

For full architectural details, see [CLAUDE.md](./CLAUDE.md).

---

## Rules

The full game rules are available in both languages:

- [Rules (English)](apps/client/src/data/locales/rules.en.md)
- [Règles (Français)](apps/client/src/data/locales/rules.fr.md)

In-game, click the **Rules** button in the header to open the rules modal at any time.

---

## Localization

The UI is fully localized in **English** and **French**. Language preference is saved in the app storage. Locale files are in `apps/client/src/data/locales/`.

---

## Deployment

Pushing a version tag (`git tag v1.0.0-beta.4 && git push origin v1.0.0-beta.4`) deploys the web client to **GitHub Pages** and the API to **Google Cloud Run** (`.github/workflows/deploy.yml`). A push to `main` only runs the CI and SonarCloud.

1. Lint → Typecheck → Format check → Architecture rules → Tests → Server build
2. `expo export --platform web` → `apps/client/dist/`, using the `API_URL`, `SUPABASE_URL` and `SUPABASE_PUBLISHABLE_KEY` repository variables
3. Deploy to `https://kevcordier.github.io/Deck-Legacy/`

The API job applies the Prisma migrations to Supabase, builds the root `Dockerfile` and deploys it to Cloud Run (details in `apps/server/CLAUDE.md`).

---

## Contributing

The project enforces quality gates via a pre-commit hook:

1. Prettier format check on staged `.ts`/`.tsx`
2. ESLint (zero warnings)
3. Full TypeScript type check
4. Dependency cruiser validation
5. Full test suite

Fix all issues before committing. Do not bypass the hook with `--no-verify`.

When adding engine logic, add corresponding unit tests. See [CLAUDE.md](./CLAUDE.md) for conventions and patterns.

---

## License

This project is open source. See [LICENSE](./LICENSE) if present.
