# Agent Contracts

Interaction rules between the project subagents defined in `.claude/agents/`. Every agent reads this file before starting. The main conversation (orchestrator) applies it when delegating.

## Agents

| Agent                | Kind            | Domain                                                         |
| -------------------- | --------------- | -------------------------------------------------------------- |
| `rules-engineer`     | writer + triage | Engine (`packages/engine`), diagnosis of every rule/card bug   |
| `card-designer`      | writer          | Game data (`packages/game-data`) + card texts (`cards.*.json`) |
| `client-developer`   | writer          | Expo app (`apps/client`), except card texts                    |
| `api-developer`      | writer          | API (`apps/server`) + HTTP contract (`packages/api-contract`)  |
| `dependency-steward` | writer          | Dependencies, lockfile, CI, repository configs                 |
| `replay-guardian`    | read-only, veto | Compatibility of event logs with the current engine and data   |
| `quality-gate`       | read-only, veto | typecheck, lint, format, depcruise, tests + coverage           |

The **user** is the final authority: game rules, breaking changes, migrations, major upgrades, commits and pushes. Every merge into `main` requires the maintainer's review and approval (EDR-037).

## 1. File ownership (who may write what)

One owner per path. An agent never edits a path it does not own; it reports the needed change in its `HANDOFF` instead.

| Path                                                                                                                                                      | Owner                                                                 |
| --------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------- |
| `packages/engine/**`                                                                                                                                      | `rules-engineer`                                                      |
| `packages/game-data/**`                                                                                                                                   | `card-designer`                                                       |
| `apps/client/src/data/locales/cards.en.json`, `cards.fr.json`                                                                                             | `card-designer`                                                       |
| `apps/client/src/data/illustrations.ts` (generated)                                                                                                       | `card-designer` (via `generate:illustrations`)                        |
| `apps/client/**` (everything else)                                                                                                                        | `client-developer`                                                    |
| `packages/api-contract/**`                                                                                                                                | `api-developer`                                                       |
| `apps/server/**` (incl. `prisma/`)                                                                                                                        | `api-developer`                                                       |
| `package.json` files, `pnpm-lock.yaml`, `pnpm-workspace.yaml`, `.nvmrc`                                                                                   | `dependency-steward`                                                  |
| `.github/**`, `.husky/**`, `eslint.config.mjs`, `.prettierrc`, `.dependency-cruiser.cjs`, `tsconfig*.json`, `vitest.config.mts`, Babel/Metro/Expo configs | `dependency-steward`                                                  |
| `CLAUDE.md` files                                                                                                                                         | owner of the area the doc describes; root `CLAUDE.md` → user approval |
| `.claude/**`                                                                                                                                              | user                                                                  |

Exception: `dependency-steward` may apply **mechanical** adaptations required by an upgrade in any workspace, and must list them; anything non-mechanical goes to the owner.

## 2. Authority (who validates what)

| Decision                                                      | Authority         | Form                                            |
| ------------------------------------------------------------- | ----------------- | ----------------------------------------------- |
| Which layer is at fault for a rule/card bug                   | `rules-engineer`  | `DIAGNOSIS` line                                |
| Meaning of a game rule or an ambiguous card text              | **user**          | escalation, never guessed                       |
| Shape of `CardDef` data, ids, card texts                      | `card-designer`   | within domain types defined by `rules-engineer` |
| Domain types, `GameCommand`, `GameEvent`, `GameView`          | `rules-engineer`  | new command/event type → user approval          |
| HTTP contract (DTOs, zod schemas)                             | `api-developer`   | breaking contract → user approval               |
| Replay compatibility of engine/data/`GameEvent` model changes | `replay-guardian` | `VERDICT` — veto; `BREAKING` → user decides     |
| Readiness to commit                                           | `quality-gate`    | `RESULT` — veto; then user commits              |
| Prisma migrations, auth/CORS changes                          | **user**          | proposed by `api-developer`                     |
| Major dependency upgrades, deployment changes                 | **user**          | proposed by `dependency-steward`                |

A veto (`replay-guardian` BREAKING or `COMPATIBLE_WITH_CONDITIONS` not yet met, `quality-gate` FAIL) blocks the flow. Only the user can override it.

## 3. Dependencies (who waits for whom)

```text
Rule / card bug
  rules-engineer (triage) ──► card-designer      (data fix)
                          ├─► rules-engineer     (engine fix)
                          └─► client-developer   (display fix)
  engine and/or data changed ──► replay-guardian ──► quality-gate ──► user commits
  display only                ──────────────────────► quality-gate ──► user commits

New card
  card-designer ──(mechanic missing?)──► rules-engineer ──► card-designer
               ──► replay-guardian (only if an existing card changed) ──► quality-gate

New player action
  rules-engineer (GameCommand + GameSession + tests) ──► replay-guardian
                 ──► client-developer (GameProvider + UI) ──► quality-gate

New API feature
  api-developer (contract, then server) ──► client-developer (services + UI) ──► quality-gate

Dependency upgrade
  dependency-steward ──► (owners for non-mechanical changes) ──► quality-gate
```

Hard ordering rules:

1. `rules-engineer` triage comes before any fix of a rule/card bug.
2. The contract (`packages/api-contract`) is changed before the server and the client.
3. An engine command/view change lands before the client consumes it.
4. `replay-guardian` reviews **every** diff touching `packages/engine`, `packages/game-data` or the `GameEvent` Prisma model, before `quality-gate`.
5. `quality-gate` always runs last, on the final state of the working tree.

## 4. Parallel work

Allowed in parallel (disjoint file ownership):

- `card-designer` ∥ `rules-engineer` once triage has split the work (data vs engine).
- `client-developer` ∥ `api-developer` once the contract is frozen.
- `client-developer` ∥ `card-designer` (card texts vs UI strings are different files).
- Read-only agents with anything, except `quality-gate`, which needs a stable tree.

Never in parallel:

- Two writers on the same path.
- `dependency-steward` with any writer (lockfile and configs affect everyone).
- `quality-gate` with any writer.

Writers working in parallel on large changes may use `isolation: worktree` when delegated.

## 5. Common report format

Every agent ends with a report starting with `STATUS:` (`DONE | BLOCKED | ESCALATE`), or `VERDICT:` / `RESULT:` for the two validators, as defined in each agent file. Subagents cannot ask the user questions: escalating means **stop, do not guess, and return an `ESCALATION` block** with the question and the options. The orchestrator relays it to the user.

## 6. Shared prohibitions (all agents)

- No commit, push, `--no-verify`, or history rewriting.
- No lowering of coverage thresholds, ESLint rules or CI gates.
- No invented game rules.
- No mutation of `GameState`; no game logic outside the engine.
- No production actions (deploy, `prisma:deploy`, production data).
- Respect the layer rules of the root `CLAUDE.md` (enforced by dependency-cruiser).

## 7. Memory

Writer agents use `memory: project` (`.claude/agent-memory/<agent>/`, versioned). They record only confirmed, non-obvious knowledge (rule interpretations validated by the user, recurring pitfalls), never what the code or `CLAUDE.md` already states. Read-only agents have no memory, so they stay strictly read-only.
