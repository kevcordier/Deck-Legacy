---
paths:
  - 'packages/engine/**'
  - 'packages/game-data/**'
---

# Engine and card reference

Detailed reference for `packages/engine` and `packages/game-data`. Repository-wide rules are in the root `CLAUDE.md`. When this file and the code disagree, the code wins: check `packages/engine/src/domain/types` and `enums`.

## Event Sourcing

The game state is derived by replaying an ordered list of `GameEvent` objects. `GameAggregate` (`packages/engine/src/application/aggregates/GameAggregate.ts`) holds the events and reconstructs `GameState` on demand. Randomness (shuffles) happens when a command runs and its result is stored in the event, so replays are deterministic.

- **Never mutate `GameState` directly.** Always dispatch a new event.
- `GameSession` (`packages/engine/src/application/session/GameSession.ts`) wraps the aggregate and turns player commands (`GameCommand`) into events: guards (unknown or blocked cards are ignored), multi-step cost payment, parchment cards, automatic campaign score at game over, rewind, development cheats. It returns a `GameView` for the UI and a translatable `CommandError` for rule errors. Mid-action state (pending choices, pending upgrade) lives only in memory, never in the event log.
- The client runs `GameSession` to play; the server uses `GameSession.restore()` to validate synced logs and compute scores.
- Tutorial games mutate the state outside events, so they are never saved or synced.
- Undo (`rewind` command) pops the last event and replays the remainder.
- To add a player action: add it to `GameCommand` (`domain/types/GameSession.ts`), handle it in `GameSession.dispatch`, test it, then expose it in the client `GameProvider`.

## Key Domain Types (packages/engine/src/domain/)

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

## Card Structure

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
  id: string                // unique action identifier structured as <cardId>-<stateId>-<n>
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

## GameState Structure

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

  // Campaign / expansion tracking
  activeExpansion?: string
  expansionMaxRound?: number // if set, a round becomes last when round >= expansionMaxRound
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

When selecting an expansion, the game resets `round` and `turn` to `0` before entering the purge flow.
This lets expansion-specific round limits (`expansionMaxRound`) be evaluated from a fresh cycle.

## Strategy Pattern (Card Actions)

`packages/engine/src/application/cardAction/` contains one strategy per `ActionEffectType` implementing `CardActionStrategy` (AddResource, AddSticker, AddBoardEffect, AddCumulated, AddGlory, BlockCard, ChoseState, DestroyCard, DiscardCard, DiscoverCard, EndGame, PlaceCardInDrawPile, PlayCard, RemoveResourceOnCard, SaveFromPurge, SetCumulated, SetLastRound, ShuffleDeck, TrackAdvance, UpgradeCard), registered in `CardActionContext`.

When adding new action types, add a new strategy file and register it in `CardActionContext`.

---

## Engine pitfalls

- **Card costs (`discard`/`destroy`) are paid from cards in play (`board + permanents`)** — do not assume `board` only when evaluating affordability or building pending choices.
- **`COUNT_AS_2` can affect selections outside `boardEffects`-only contexts** (e.g. discard-based selections): keep intrinsic passives and board effects aligned when filtering selectable cards.
- **Cards reference each other by state name and by id** (selectors, `upgradeTo`, `states.ids`): a typo silently matches nothing. Check the target exists.
- **The engine runs on Hermes, browsers and Node:** check that any global API (`crypto`, `structuredClone`, `Intl`…) exists on Hermes before using it.
