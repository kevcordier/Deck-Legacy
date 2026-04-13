# Deck Legacy

![Branches](./badges/coverage-branches.svg)

![Functions](./badges/coverage-functions.svg)

![Lines](./badges/coverage-lines.svg)

![Statements](./badges/coverage-statements.svg)

![Coverage total](./badges/coverage-total.svg)

[![Quality Gate Status](https://sonarcloud.io/api/project_badges/measure?project=kevcordier_Deck-Legacy&metric=alert_status)](https://sonarcloud.io/summary/new_code?id=kevcordier_Deck-Legacy)

A browser-based single-player deck-building card game with a medieval theme. Build and evolve your deck across multiple rounds, manage resources, and maximize your Glory score.

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

**Requirements:** Node.js v20 (see `.nvmrc`)

```bash
# Install dependencies
pnpm install

# Start the development server (hot reload)
pnpm dev
```

Open [http://localhost:5173/Deck-Legacy/](http://localhost:5173/Deck-Legacy/) in your browser.

### Available Scripts

| Command              | Description                          |
| -------------------- | ------------------------------------ |
| `pnpm dev`           | Development server with hot reload   |
| `pnpm build`         | Production build (`dist/`)           |
| `pnpm test`          | Run unit tests once                  |
| `pnpm test:watch`    | Run tests in watch mode              |
| `pnpm test:coverage` | Coverage report for the engine layer |
| `pnpm lint`          | ESLint (zero-warning policy)         |
| `pnpm lint:fix`      | Auto-fix ESLint violations           |
| `pnpm typecheck`     | TypeScript check without emit        |
| `pnpm format`        | Prettier format `src/`               |
| `pnpm storybook`     | Component explorer on port 6006      |

---

## Tech Stack

- **React 19** — UI framework
- **TypeScript 5** — Strict mode throughout
- **Vite 6** — Build tool
- **Vitest** — Unit testing with v8 coverage
- **i18next** — Internationalization (English & French)
- **Storybook 8** — Component documentation
- **ESLint + Prettier** — Code quality

No backend. All game logic runs client-side; save data is stored in `localStorage`.

---

## Architecture

The codebase follows Clean Architecture / Domain-Driven Design with three explicit layers:

```
src/
├── engine/
│   ├── domain/          # Pure types, enums, interfaces — zero logic
│   ├── application/     # Use cases, business logic, event sourcing
│   └── infrastructure/  # localStorage persistence, data loaders
├── components/          # React UI components (feature folders)
├── hooks/               # Custom React hooks (useGame integration point)
├── data/                # Static game data (cards, stickers, deck)
├── i18n/                # i18next setup + EN/FR locale files
└── styles/              # Global CSS
```

**Event Sourcing** — The entire game state is derived by replaying an ordered list of `GameEvent` objects. Nothing is mutated directly; the undo feature comes for free.

**Strategy Pattern** — Each card action type (AddResource, Upgrade, Destroy, etc.) is an independent strategy, making new mechanics easy to add.

For full architectural details, see [CLAUDE.md](./CLAUDE.md).

---

## Rules

The full game rules are available in both languages:

- [Rules (English)](src/i18n/locales/rules.en.md)
- [Règles (Français)](src/i18n/locales/rules.fr.md)

In-game, click the **Rules** button in the header to open the rules modal at any time.

---

## Localization

The UI is fully localized in **English** and **French**. Language preference is saved to `localStorage`. Locale files are in `src/i18n/locales/`.

---

## Deployment

The game is deployed to **GitHub Pages** via a CI/CD pipeline that runs on every push to `main`:

1. Lint → Typecheck → Format check → Tests
2. `vite build` → `dist/`
3. Deploy to `https://kevcordier.github.io/Deck-Legacy/`

---

## Contributing

The project enforces quality gates via a pre-commit hook:

1. Prettier format check on staged `.ts`/`.tsx`
2. ESLint (zero warnings)
3. Full TypeScript type check
4. Full test suite

Fix all issues before committing. Do not bypass the hook with `--no-verify`.

When adding engine logic, add corresponding unit tests. See [CLAUDE.md](./CLAUDE.md) for conventions and patterns.

---

## License

This project is open source. See [LICENSE](./LICENSE) if present.
