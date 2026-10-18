# Clean architecture migration (EDR-058)

Plan to give the engine, the server and the client the same four layers. Each step is one PR to `main`, reviewed and approved by the maintainer, with `pnpm verify` green. Engine PRs are also reviewed by `replay-guardian`.

## Target

| Layer             | Holds                                                                                                                             | May import                                              |
| ----------------- | --------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------- |
| `domain/`         | Entities, value objects, **pure business rules (types and functions)**. No framework, I/O, clock or non-deterministic randomness. | itself (+ the engine domain)                            |
| `application/`    | Use cases, session state, **ports** and their input/output models                                                                 | `domain/`                                               |
| `infrastructure/` | Port implementations: Prisma, Supabase, AsyncStorage, openapi-fetch, i18next                                                      | `application/`, `domain/`                               |
| `presentation/`   | React UI, routing, animations; Nest controllers, guards, filters, **HTTP DTOs** and their mapping                                 | `application/`, `domain/` — **never `infrastructure/`** |
| composition root  | `main.ts` + Nest modules; client `composition/` + `AppServicesProvider`                                                           | everything                                              |

Question to place a file: _true without an app?_ → domain. _A scenario triggered by an actor?_ → application. _Talks to a library or the outside world?_ → infrastructure. _Only exists for display or the HTTP protocol?_ → presentation.

Unchanged: one public export per file and naming (EDR-057), packages never import apps, client and server never import each other, no browser API in packages (EDR-014).

## Order

| #   | PR                                                                 | Scope            | Replay risk       | Size |
| --- | ------------------------------------------------------------------ | ---------------- | ----------------- | ---- |
| 1   | `refactor(engine): game rules in the domain`                       | engine moves     | none (moves only) | L    |
| 2   | `refactor(engine): one export per file`                            | engine splits    | none              | M    |
| 3   | `refactor(engine): clock, ids and random ports`                    | engine behaviour | **watch**         | M    |
| 4   | `refactor(server): DTOs in presentation, models in application`    | server           | none              | M    |
| 5   | `refactor(server): ports for users, scores, auth`                  | server           | none              | M    |
| 6   | `refactor(client): domain, application and presentation placement` | client           | none              | M    |
| 7   | `refactor(client): services injected by context`                   | client           | none              | L    |

Engine first: the client and server phases then import its final paths once. Server and client PRs are independent of each other and can run in parallel after PR 3.

---

## PR 1 — Engine: game rules in the domain

Move (`git mv`, no code change) from `packages/engine/src/application/` to `packages/engine/src/domain/`:

- `aggregates/` (`GameAggregate`, `CardActionAggregate`), `gameEvent/`, `cardAction/`, `playerChoice/`
- `effectResolver.ts`, `costResolver.ts`, `cardSelector.ts`, `stateSelector.ts`, `cardHelpers.ts`, `gameStateHelper.ts`
- `resources.ts`, `resourceEquivalence.ts`, `random.ts`, `factory.ts`, `emptyState.ts`, `campaignSegments.ts`

`application/` keeps `session/` (`GameSession.ts`, `playerInput.ts`).

Also:

- `package.json` `exports`: `./domain/cardAction`, `./domain/gameEvent` replace the `application/` entries (the `./*` wildcard covers the rest).
- Update the imports of the apps and game-data (≈ 48: `application/emptyState` 13, `cardHelpers` 11, `gameStateHelper` 6, `factory` 5, `resources`, `effectResolver`, `GameAggregate`, `cardSelector`).
- Tests: `packages/engine/tests/application/**` → `tests/domain/**` except `session/`.
- dependency-cruiser: keep `domain-self-contained` and `application-only-domain` (now meaningful: the rules have no dependency on the session).
- Docs: root `CLAUDE.md` (Layout: "domain = game rules, application = session"), `.claude/rules/engine-reference.md` (paths), `.claude/agents/rules-engineer.md`, `replay-guardian.md`, the `add-card` skill if it cites paths.

Check: `pnpm verify`; `tests/verification.fuzz.test.ts` (server) still verifies random games; `replay-guardian` confirms no logic change (`git diff -M --stat` shows only renames + import lines).

## PR 2 — Engine: one public export per file

Split the files that export several values:

| File                                                                                                                  | Exports | Into                                  |
| --------------------------------------------------------------------------------------------------------------------- | ------- | ------------------------------------- |
| `cardSelector.ts`                                                                                                     | 14      | `domain/cards/selection/<fn>.ts`      |
| `cardHelpers.ts`                                                                                                      | 13      | `domain/cards/<fn>.ts`                |
| `gameStateHelper.ts`                                                                                                  | 12      | `domain/state/<fn>.ts`                |
| `playerInput.ts`                                                                                                      | 4       | `application/session/input/<fn>.ts`   |
| `resources.ts`, `resourceEquivalence.ts`                                                                              | 3 each  | `domain/resources/<fn>.ts`            |
| `effectResolver.ts`, `emptyState.ts`, `GameAggregate.ts`, `DefeatCardStrategy.ts`, `GameSession.ts` (`checkpointSeq`) | 2 each  | one file per export                   |
| `domain/kingdomLimits.ts`                                                                                             | 4       | stays (constants) + `kingdomLimit.ts` |

Reuse the splitter used for the client (EDR-057 PR): it moves top-level declarations with their imports and rewrites importers by symbol. Add ESLint `max-classes-per-file` already applies; no new rule.

Check: `pnpm verify`; `replay-guardian`.

## PR 3 — Engine: clock, ids and randomness as ports

The domain still calls `Date.now()` (event timestamps: `SkipTriggerStrategy`, `UpgradeCardEventStrategy`…), `crypto.randomUUID()` (trigger pile keys: `gameStateHelper`, `CardProducedStrategy`, `UpgradeCardEventStrategy`, `TurnStartedStrategy`) and `Math.random` (shuffle of seedless games, `random.ts`).

- `domain/ports/Clock.ts`, `IdGenerator.ts`, `RandomSource.ts` (interfaces) passed through the context the strategies already receive.
- `application/session/GameSession` gets them through its options, defaulting to `Date.now`, `crypto.randomUUID`, `Math.random` — **same values as today**.
- ESLint `no-restricted-properties` / `no-restricted-globals` in `packages/engine/src/domain/**`: `Date.now`, `Math.random`, `crypto`.

Replay: `GameSession.verify` already ignores ids, timestamps and random trigger keys; seeded shuffles are unchanged (`mulberry32`); seedless games keep `Math.random`. Add a test that runs a full game with a fixed clock and id generator and compares the events twice.

Check: `pnpm verify`; `replay-guardian` (mandatory); fuzz test; replay an exported real game (`GET /games/:id/export`) on the client and server.

## PR 4 — Server: DTOs in presentation, models in application

- `apps/server/src/<module>/application/dto/` → `<module>/presentation/dto/` (zod + Swagger stay there).
- Use cases take and return application models (`application/models/`: `SyncGameCommand`, `GameSummary`, `GameExport`, `UserProfile`, `KingdomRanking`…, plain TS types). Controllers map DTO ↔ model (mostly identity; one `to<Model>()` per DTO).
- `ApiErrorDto`, `nullableStringSchema` → `shared/presentation/http/`.
- dependency-cruiser: forbid `application/` → `presentation/` (already) and `domain/` → anything but itself.
- `openapi.json` must not change (e2e snapshot): pure moves.

Check: `pnpm verify`; `pnpm generate:api` gives no diff.

## PR 5 — Server: ports for users, scores and auth

| Today                                                   | Port (application)                              | Implementation (infrastructure)                  |
| ------------------------------------------------------- | ----------------------------------------------- | ------------------------------------------------ |
| `UsersService` uses Prisma + Supabase admin API         | `UsersRepository`, `IdentityAdmin`              | `PrismaUsersRepository`, `SupabaseIdentityAdmin` |
| `ScoresService` uses Prisma                             | `ScoresRepository`                              | `PrismaScoresRepository`                         |
| `SupabaseTokenVerifier` used by `AuthGuard`             | `TokenVerifier`                                 | `SupabaseTokenVerifier`                          |
| `SyncGameUseCase` → `ScoresService.syncGameScores(tx…)` | `ScoreMirror` (written in the game transaction) | `PrismaScoreMirror`                              |

Use cases: `GetProfile`, `UpdateDisplayName`, `DeleteAccount`, `EnsureUser`; `GetLeaderboard`, `GetKingdomLeaderboard`, `GetMyScores`. The in-memory user cache of `UsersService.ensureUser` stays in `EnsureUser` (application state, no I/O).

`AuthGuard` stays in `presentation/` (Nest) and depends on `TokenVerifier` + `EnsureUser`.

Check: `pnpm verify` (server coverage 80 % / 60 % branches); `persistence.test.ts` split per repository; e2e unchanged.

## PR 6 — Client: placement

| From                                                                                  | To                                                                                                               | Why                             |
| ------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------- | ------------------------------- |
| `domain/kingdom/slugify`, `kingdomPath`, `kingdomIdFromParam`                         | `presentation/routing/`                                                                                          | URLs of expo-router             |
| `domain/card/mergeOrder`, `findDrawnCards`, `findUpgradeReveal`                       | `presentation/board/`                                                                                            | drag and drop order, animations |
| `domain/kingdom/maxKingdoms`                                                          | `domain/kingdom/` (stays)                                                                                        | kingdom limit rule              |
| `application/ports/ApiError`, `apiTypes`                                              | stay (port contract)                                                                                             |                                 |
| kingdom operations called from the UI (`kingdomStore.create/rename/abandon/saveGame`) | `application/kingdom/CreateKingdom`, `RenameKingdom`, `AbandonKingdom`, `SaveGame` (they also schedule the sync) | scenarios of the player         |
| `composition/bootstrapStorage.ts`                                                     | `application/startup/StartApp` (+ ports)                                                                         | startup scenario                |

Check: `pnpm verify`; Storybook starts.

## PR 7 — Client: services injected by context

New ports in `application/ports/`: `Notifier` (toast), `Preferences` (language, tutorial, resource warning, offline choice), `CardCatalog` (catalog + illustrations), `AuthGateway` (Supabase session, sign-in/up, password, sign-out), `AccountApi` (`/me`, leaderboard).

- `composition/AppServicesProvider.tsx` builds the implementations once and exposes them with a context; `useAppServices()` reads it.
- Replace the 13 presentation files that import `@infrastructure/*` (`GameProvider`, `GameUIProvider`, `AuthProvider`, `MiniGameCard`, `GameCard`, `CardNumber`, `AccountPanel`, `SignInForm`, `Home`, `Game`, `Scoreboard`, `app/_layout`, `app/game/[kingdom]`) and the 11 that import `@composition/*` singletons.
- Storybook (`StoryProviders`) and component tests provide fake services.
- dependency-cruiser: `client-presentation-no-infrastructure` (from `presentation/` and `app/` to `infrastructure/` and `composition/` except `AppServicesProvider` in `app/_layout`).

Check: `pnpm verify`; web at ≤ 375 px and ≥ 1024 px (tutorial, choice + cancel, undo, sync, conflict, sign-in, scoreboard); iOS via Expo; Storybook.

## Guardrails added along the way

- dependency-cruiser: same four-layer rules for `packages/engine`, `apps/server/src/<module>`, `apps/client/src`.
- ESLint in `domain/` and `application/`: `no-restricted-imports` for `react`, `react-native`, `@nestjs/*`, `zod`, Prisma, `expo-*`; in `domain/`: `no-restricted-properties`/`globals` for `Date.now`, `Math.random`, `crypto`.
- `pnpm verify` before each commit; `quality-gate` before each PR; `replay-guardian` for PRs 1–3.

## Documentation to update (in the PR that changes the structure)

Root `CLAUDE.md` (Layout, Where things go, Architecture table), `apps/client/CLAUDE.md`, `apps/server/CLAUDE.md`, `.claude/rules/engine-reference.md`, `.claude/contracts.md`, `.claude/agents/*` (paths), `README.md` layout.
