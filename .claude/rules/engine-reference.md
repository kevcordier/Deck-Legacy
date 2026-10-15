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
- Tutorial games are real games whose first draw order is imposed (`GameSession.start(…, 'tutorial', firstDrawPile)`); the order is stored in `ROUND_STARTED` like a shuffle. They are not saved until the player keeps them (EDR-040).
- Undo (`rewind` command) pops the last event and replays the remainder.
- To add a player action: add it to `GameCommand` (`domain/types/GameSession.ts`), handle it in `GameSession.dispatch`, test it, then expose it in the client `GameProvider`.

## Key Domain Types (packages/engine/src/domain/)

| Type              | Description                                                                                                                        |
| ----------------- | ---------------------------------------------------------------------------------------------------------------------------------- |
| `CardDef`         | Static card template with states, productions, upgrade paths, effects                                                              |
| `CardInstance`    | Runtime card: `{id, cardId, stateId, stickers, trackProgress, expansion?, expansionId?}` (`expansionId` = printed number, EDR-047) |
| `GameState`       | Full snapshot: piles, board, instances, resources, trigger stack                                                                   |
| `GameEvent`       | Discriminated union of all recordable events                                                                                       |
| `PendingChoice`   | Prompt awaiting player input (card select, resource, state)                                                                        |
| `Action` / `Cost` | Effect definitions for card abilities                                                                                              |
| `Resource`        | `{gold, wood, stone, iron, weapon, goods}`                                                                                         |
| `Sticker`         | Persistent card modifier (production bonus, glory, stay-in-play)                                                                   |

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
                              // POTION | LOOT | LIVESTOCK | HORSE | LADY | WAGON
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
  cost?: Cost               // resource or card cost to pay; a resource amount `'any'` (e.g. Export's
                            // goods) lets the player pay 1..stock, and the effects apply once per unit
  endsTurn?: boolean        // if true then ends turn after this action resolution
  trigger?: Trigger         // fired automatically on the given trigger
  optional?: boolean        // only for trigger effects — allows skipping the trigger
  condition?: Condition     // a trigger fires only if it holds; a regular action can only be used if it holds
                            // (cardCount | production | resource | and | or | not | expansionActive | accumulation |
                            // justPlayed = this card is one of the cards just played)
  defeat?: boolean          // the action defeats an enemy: queues the ON_DEFEAT triggers in play
  triggeredBy?: CardSelector // the trigger also fires while this card is in play when a card matching
                            // it causes it (scope DRAWN = the cards just played, DISCARDED = just
                            // discarded). "When X is played" cards (Volcanic Eruption, Assassin…) add
                            // condition { not: justPlayed } so they don't fire for themselves.
                            // Passives never carry triggers: every triggered effect is a CardAction.
}

ActionEffect {
  id: number                    // unique action effect identifier
  type: ActionEffectType        // ADD_RESOURCES | REMOVE_RESOURCE_ON_CARD | DISCARD_CARD |
                                // DISCOVER_CARD | DESTROY_CARD | UPGRADE_CARD | PLACE_CARD_IN_PILE |
                                // BLOCK_CARD | PLAY_CARD | ADD_STICKER | CHOOSE_STATE | BOOST_CARD |
                                // COST | ADD_CUMULATED | SET_CUMULATED | TRACK_ADVANCE |
                                // ADD_BOARD_EFFECT | CHOOSE_EFFECT | END_GAME | SHUFFLE_DECK | ADD_GLORY |
                                // SAVE_FROM_PURGE | ADD_TO_PURGE | ADVANCE_STORY
  cards?: CardSelector          // target card filter (scope, tags, ids…)
  resources?: ResourceSelector  // target resource filter
  states?: StateSelector        // state ids choice
  stickers?: StickerSelector    // sticker ids choice
  value?: number                // generic numeric value
  position?: number | 'top' | 'bottom'  // position in pile for PLACE_CARD_IN_PILE
  effect?: Passive              // passive effect for ADD_BOARD_EFFECT
  effects?: ActionEffect[]      // nested effects for CHOOSE_EFFECT
  steps?: { pickNumber?: number; pickMin?: number; pickMax?: number }
  condition?: Condition         // checked when this effect resolves (after the previous ones):
                                // the effect is skipped when it does not hold
}

TrackDef {
  steps: StepDef[]        // ordered list of steps
  inOrder: boolean        // must be accessed sequentially; TRACK_ADVANCE marks 1 step, or
                          // steps.pickNumber / valuePerElement steps in order (0 marks none)
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
  discoveryPile:  number[]   // campaign pile: STORY_ADVANCED discovers its first cards each round
  discoverablePile?: number[] // cards only discovered by effects (absent in games started before EDR-045)
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

`packages/engine/src/application/cardAction/` contains one strategy per `ActionEffectType` implementing `CardActionStrategy` (AddResource, AddSticker, AddBoardEffect, AddCumulated, AddGlory, AddToPurge, BlockCard, ChoseState, DestroyCard, DiscardCard, DiscoverCard, EndGame, PlaceCardInDrawPile, PlayCard, RemoveResourceOnCard, SaveFromPurge, SetCumulated, ShuffleDeck, TrackAdvance, UpgradeCard), registered in `CardActionContext`.

When adding new action types, add a new strategy file and register it in `CardActionContext`.

---

## Triggers and passives added for Ridding the Woods

- `Trigger.ON_DEFEAT`: fired on the cards in play (board + permanents) after an action with `defeat: true`.
- `Trigger.ON_PURGE_SELECTION`: fired by the unselected cards of the purge pool when the purge is finalised; identical copies (same `actionEffects`) fire once. Used with `ADD_TO_PURGE` (adds cards to `purgeState.selectedCardIds`).
- Negative cards are never purge candidates (batches and permanents).
- `ExpansionConfig.purge.focus` (`{ resource, count }`, copied into `EXPANSION_SELECTED.purgeFocus` then `purgeState.focus`): while fewer than `count` selected cards produce `resource`, the batch candidates are limited to those producers when the batch has any.
- `ExpansionConfig.stickers` (`{ stickerId: count }`) is copied into `EXPANSION_SELECTED.addedStickers` and added to `stickerStock` when the expansion starts.
- `PassiveType.RESTRICT_GAIN` (`resources` = allowed types): other resources are dropped from production choices and `ADD_RESOURCES`.
- `PassiveType.REQUIRES_IN_PLAY` (`cards` selector): the card is discarded as soon as no card matches, checked when cards are drawn and after every card action.
- `TargetScope.STAYING`: keeps the selected cards that stay in play (use with `BOARD`).
- `ValuePerElement.ownProduction`: counts the total production of the card itself. For effects other than `TRACK_ADVANCE`, `value` = (`value` ?? 1) × `amount` × count (`REMOVE_RESOURCE_ON_CARD` crosses out `value` times; `ADD_STICKER` stickers every chosen card).
- `LAST_SELECTED` alone picks all last selected cards, unless `pickNumber`/`pickMax` asks the player to choose among them.
- Two packs (EDR-045): `campaign` and `discoverable` in each `deck.json`. At round start `STORY_ADVANCED` discovers the first `discoverPerRound` cards of `discoveryPile` (campaign); an empty campaign pile then ends the campaign (`GAME_ENDED`), which empties it. Effects discover from both piles; `ADVANCE_STORY` (`value` cards, EDR-046) discovers the first cards of the campaign pile. A discoverable card already in the game (another campaign of the same expansion) is neither recreated nor put back at `EXPANSION_SELECTED`. Games without `discoverablePile` keep the single-pile rules.
- `EXPANSION_SELECTED.expansionDiscoveryFirst` (always set by new events): expansion cards go before the remaining base cards in the discovery pile; `onStart.discover.ids` gives the first round its discoveries.
- `PassiveType.RESTRICT_SPEND` (`resources` = reserved types): they pay only upgrade costs (`Cost.forUpgrade`, set by `getEffectiveUpgradeCost`), never action, step or discover costs.

## Engine pitfalls

- **Card costs (`discard`/`destroy`) are paid from cards in play (`board + permanents`)** — do not assume `board` only when evaluating affordability or building pending choices.
- **`COUNT_AS_2` can affect selections outside `boardEffects`-only contexts** (e.g. discard-based selections): keep intrinsic passives and board effects aligned when filtering selectable cards.
- **Cards reference each other by state name and by id** (selectors, `upgradeTo`, `states.ids`): a typo silently matches nothing. Check the target exists.
- **The engine runs on Hermes, browsers and Node:** check that any global API (`crypto`, `structuredClone`, `Intl`…) exists on Hermes before using it.
