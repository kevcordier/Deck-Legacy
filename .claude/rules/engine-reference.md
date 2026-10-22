---
paths:
  - 'packages/engine/**'
  - 'packages/game-data/**'
---

# Engine and card reference

Detailed reference for `packages/engine` and `packages/game-data`. Repository-wide rules are in the root `CLAUDE.md`. When this file and the code disagree, the code wins: check `packages/engine/src/domain/types` and `enums`.

## Layers (EDR-058)

- `domain/` — the game rules: types, enums, errors, `aggregates/` (`GameAggregate` replays events), `gameEvent/` (one strategy per event), `cardAction/` (one strategy per effect), `playerChoice/`, resolvers, selectors, resources, `random`, `factory`, `emptyState`. Pure: no I/O, no framework.
- `application/` — `session/`: `GameSession` (commands → events, pending choices in memory, `verify`, `restore`) and `input/` (one guard per file: `isFlowCommandAllowed`, `isInPlay`, `sanitizeChoice`, `sanitizeCost`).
- dependency-cruiser: the domain imports only itself; the application imports only the domain.
- One public export per file (EDR-057): `domain/cards/` (costs, affordability, triggers, tag classes), `domain/cards/selection/` (card selector, active state, productions, glory, conditions), `domain/state/` (draw, discard, destroy, spend, empty state, `checkpointSeq`), `domain/resources/`, `domain/effects/`, `domain/kingdom/`.

## Event Sourcing

The game state is derived by replaying an ordered list of `GameEvent` objects. `GameAggregate` (`packages/engine/src/domain/aggregates/GameAggregate.ts`) holds the events and reconstructs `GameState` on demand. Randomness (shuffles) happens when a command runs and its result is stored in the event, so replays are deterministic. Games started since EDR-051 carry a `seed` in `GAME_STARTED`: every shuffle comes from `domain/random.ts` (seed + salt + shuffled cards), so running the same commands again gives the same events. Never use `Math.random`, `Date.now()`, `crypto` or the order of random keys in game logic: the domain reads time, ids and seedless randomness from `environment` (`domain/environment/`), which `GameSession` installs (system implementation `application/session/systemEnvironment.ts`, or `GameSessionOptions.environment` in tests). ESLint enforces it (EDR-058). Tests that use aggregates or strategies without a session get the system environment from `tests/setup.ts`.

- **Never mutate `GameState` directly.** Always dispatch a new event.
- `GameSession` (`packages/engine/src/application/session/GameSession.ts`) wraps the aggregate and turns player commands (`GameCommand`) into events: guards (unknown or blocked cards are ignored), multi-step cost payment, parchment cards, automatic campaign score at game over, rewind, development cheats. It returns a `GameView` for the UI and a translatable `CommandError` for rule errors. Mid-action state (pending choices, pending upgrade) lives only in memory, never in the event log.
- The client runs `GameSession` to play; the server uses `GameSession.verify()` to check synced logs and compute scores (`restore()` only for older games without a seed).
- **Recorded commands (EDR-051).** `execute()` sets the commands run since the previous event on the first event they produce (`GameEvent.commands`; trigger ids become `@<source>|<actionId>|<rank>`). `verify()` restarts the game from the seed, runs them again and compares the events (ids, timestamps and random trigger keys aside), rewinding the events the player rewound.
- **Player input is checked** in `session/input/`: flow commands only in the phases the UI offers them, choices and cost payments rebuilt from the pending choice (offered values, pick bounds), card actions and upgrades only for cards in play, productions only for a card in play whose production gains something (and an offered choice), mandatory triggers cannot be skipped. A new command or choice type needs its check there, or a modified client can send it.
- Tutorial games are real games whose first draw order is imposed (`GameSession.start(…, 'tutorial', firstDrawPile)`); the order is stored in `ROUND_STARTED` like a shuffle. They are not saved until the player keeps them (EDR-040).
- Undo (`rewind` command) pops the last event and replays the remainder.
- **Checkpoints (EDR-052).** `checkpointSeq(events)` gives where the server keeps a checkpoint (after the commands that drew the first turn of the last round). `GameSession.verify(…, checkpoint)` and `GameSession.restore(…, checkpoint)` start from its state and only run what follows; the earlier events stay in the log (shuffle salts use the log position). A session resumed at a checkpoint never rewinds before it (EDR-053).
- To add a player action: add it to `GameCommand` (`domain/types/GameSession.ts`), handle it in `GameSession.dispatch`, guard it in `session/input/`, test it (including `GameSession.verify`), then expose it in the client `GameProvider`.

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
  chooseName?: boolean        // if true, the player can choose a name on the card
  tags?: CardTag[]            // ARTIFACT | LAND | BUILDING | PERSON | EVENT | ENEMY | SEAFARING |
                              // GOAL | KNIGHT | ELDER | WALL | STATE | SHIP | ITEM | INVENTION |
                              // POTION | LOOT | LIVESTOCK | HORSE | LADY | WAGON | PERMANENT
                              // (PERMANENT: stays on board instead of going to discard
                              // at the end of turn; check it with `isPermanent(state)`)
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
                                // SAVE_FROM_PURGE | ADD_TO_PURGE | ADVANCE_STORY | DEFEAT_CARD
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

`packages/engine/src/domain/cardAction/` contains one strategy per `ActionEffectType` implementing `CardActionStrategy` (AddResource, AddSticker, AddBoardEffect, AddCumulated, AddGlory, AddToPurge, BlockCard, ChoseState, DefeatCard, DestroyCard, DiscardCard, DiscoverCard, EndGame, PlaceCardInDrawPile, PlayCard, RemoveResourceOnCard, SaveFromPurge, SetCumulated, ShuffleDeck, TrackAdvance, UpgradeCard), registered in `CardActionContext`.

When adding new action types, add a new strategy file and register it in `CardActionContext`.

---

## Triggers and passives added for Ridding the Woods

- `Trigger.ON_DEFEAT`: fired on the cards in play (board + permanents) after an action with `defeat: true`.
- `ActionEffectType.DEFEAT_CARD` (Trebuchet): the player picks among the `cards` that have a `defeat` action; each one's defeat is queued as a mandatory trigger of that enemy, without its cost. A "destroy this card" cost becomes a first `DESTROY_CARD` self effect (a cost is paid from cards in play, and the enemy may be in the discard pile). The card using it carries no `defeat` flag: the enemy's action fires `ON_DEFEAT`.
- `Trigger.ON_PURGE_SELECTION`: fired by the unselected cards of the purge pool when the purge is finalised; identical copies (same `actionEffects`) fire once. Used with `ADD_TO_PURGE` (adds cards to `purgeState.selectedCardIds`).
- Negative cards are never purge candidates (batches and permanents).
- `ExpansionConfig.purge.focus` (`{ resource, count }`, copied into `EXPANSION_SELECTED.purgeFocus` then `purgeState.focus`): while fewer than `count` selected cards produce `resource`, the batch candidates are limited to those producers when the batch has any.
- `ExpansionConfig.stickers` (`{ stickerId: count }`) is copied into `EXPANSION_SELECTED.addedStickers` and added to `stickerStock` when the expansion starts.
- `PassiveType.RESTRICT_GAIN` (`resources` = allowed types): other resources are dropped from production choices and `ADD_RESOURCES`.
- `PassiveType.REQUIRES_IN_PLAY` (`cards` selector): the card is discarded as soon as no card matches, checked when cards are drawn and after every card action.
- `TargetScope.STAYING`: keeps the selected cards that stay in play (use with `BOARD`).
- `ValuePerElement.ownProduction`: counts the total production of the card itself. For effects other than `TRACK_ADVANCE`, `value` = (`value` ?? 1) × `amount` × count (`REMOVE_RESOURCE_ON_CARD` crosses out `value` times; `ADD_STICKER` stickers every chosen card).
- `LAST_SELECTED` alone picks all last selected cards, unless `pickNumber`/`pickMax` asks the player to choose among them.
- Two packs (EDR-045): `campaign` and `discoverable` in each `deck.json`. At round start `STORY_ADVANCED` discovers the first `discoverPerRound` cards of `discoveryPile` (campaign); when a round ends with fewer than `discoverPerRound` cards in it, that round is the last (`isLastRound(state, parameters)`, EDR-054) and the campaign ends (`GAME_ENDED`), which empties it. Effects discover from both piles; `ADVANCE_STORY` (`value` cards, EDR-046) discovers the first cards of the campaign pile. A discoverable card already in the game (another campaign of the same expansion) is neither recreated nor put back at `EXPANSION_SELECTED`. Games without `discoverablePile` keep the single-pile rules.
- `EXPANSION_SELECTED.expansionDiscoveryFirst` (always set by new events): expansion cards go before the remaining base cards in the discovery pile; `onStart.discover.ids` gives the first round its discoveries.
- `PassiveType.RESTRICT_SPEND` (`resources` = reserved types): they pay only upgrade costs (`Cost.forUpgrade`, set by `getEffectiveUpgradeCost`), never action, step or discover costs.

## Mechanics added for Merchants

- A card's own `DESACTIVATE_OPTION` never blocks its own actions or upgrades (`canUseOptions(state, option, instanceId)`): Brigands forbids "other {{time}} effects". `Options.PLAY_CARD` also stops `PLAY_CARD` effects ("you cannot play cards").
- Sticker `effectId: 'starts_in_play'` (sticker 17): the card joins the first draw of each round (`GameAggregate.turnStarted`, recorded in `TURN_STARTED.turnCards`). `Sticker.action` (sticker 18) gives the card an action: read a card's actions with `getStateActions(instance, defs, stickerDefs)`, never `state.actions` alone.
- `ActionEffectType.USE_CARD_ACTION` (Turmeric, `cards` = the cards whose effect can be used): the player picks the card, then one of its usable non-trigger actions (`getUsableActionEffects`, a `CHOOSE_ACTION_EFFECT` of `usedAction` effects). The used action's cost is paid and its effects resolve for its card (`ActionEffect.sourceInstanceId`, inherited by the effects they add); that card is not discarded and the turn does not end.
- `ActionEffectType.LOSE_NEXT_RESOURCES` (Too Much Mead, `value` units): adds to `GameState.resourcesToLose`, which `ADD_RESOURCES` and `CARD_PRODUCED` take their units from (`loseGainedResources`, in resource order within one gain); `TURN_STARTED` clears it.
- `ADD_RESOURCES` with `resources.cards.autoPick` (Mead: "gain each person's production") gains the production of every matching card; a card with several productions asks which one.

## Engine pitfalls

- **Card costs (`discard`/`destroy`) are paid from cards in play (`board + permanents`)** — do not assume `board` only when evaluating affordability or building pending choices.
- **`COUNT_AS_2` can affect selections outside `boardEffects`-only contexts** (e.g. discard-based selections): keep intrinsic passives and board effects aligned when filtering selectable cards.
- **Cards reference each other by state name and by id** (selectors, `upgradeTo`, `states.ids`): a typo silently matches nothing. Check the target exists.
- **The engine runs on Hermes, browsers and Node:** check that any global API (`crypto`, `structuredClone`, `Intl`…) exists on Hermes before using it.

## Mechanics added for Foundations: Church

- Blessed cards: `CardTag.BLESSED` (printed blessing) or the blessing sticker 38. Sticker tags are not read by selectors: match both with `{ tags: [CardTag.BLESSED], orStickerIds: [38] }` (`CardSelector.orStickerIds`).
- `PassiveType.ADD_PRODUCTION_CHOICE` (`choices`): each production of the selected cards gets one of the bonuses on top (Archbishops' "+gold / science").
- `PassiveType.PREVENT_STAY_IN_PLAY` (Skepticism): the selected cards cannot stay in play, unless permanent. `PassiveType.UPGRADE_KEEPS_TURN` (Renowned School): upgrading the selected cards does not end the turn (`UpgradeCardEvent.keepsTurn`).
- A `CHOOSE_EFFECT` option with a `condition` is only offered when it holds (a new Archbishop each round: the last choice is kept in `cumulated`).
- `PLACE_CARD_IN_PILE` with `deck: 'board'`: the cards start in play without being played (Silvanus).
- `CardAction.amountPer` with an `'any'` resource cost: the effects apply once per `amountPer` units ("for every 3 science spent").
- `ValuePerElement` with both `cards` and `productionTotal`: the total production of that resource on the selected cards.
- Archbishops (Foundations 72–74): the 3 printed cards count as one permanent card, so one card (245) with a state per Archbishop; its round-start trigger turns it to a new state (`chooseArchbishop`), task step ids are unique on the card so marked tasks stay. Card 71 discovers it and stays as the rule reminder.

## Mechanics added for Foundations: Romance

- Sticker tags count in selectors: a person with the Knight sticker (11) is a knight for every effect, base game included (needs the sticker defs passed to `cardSelector`). Scarves 591–596 (printed 59a–f) carry the `scarf` tag; ladies have it printed.
- `PassiveType.MULTIPLY_PRODUCTION` (`amount`): the whole production of the selected cards is multiplied (Guinevere).
- Written medals (Famous Court): `ADD_GLORY` with `valuePerElement.glory` (the glory of the selected cards) and `writeNames` stores the names in `CardInstance.writtenNames`; `CardSelector.notWrittenHere` leaves those names out.
- `TRACK_ADVANCE` on an `inOrder` track with `steps.ids` marks the next step among those ids (quests: green task boxes and red timer boxes on one track). `Condition.stepsMarked` holds once all its step ids are marked.
- `CardSelector.notStaying`: cards that do not stay in play (Endurance).
- Several `upgrade` entries to the same state are ways to pay it (The Round Table: a Craftsman or 4 persons): `resolveUpgrade` takes `upgradeIndex`, the entry the player chose; without it (older commands) the first entry to `upgradeTo` is used.
- Quests (Foundations 99–104, `quest()`): rescued by a knight without a scarf, who gets the lady's scarf; the end-of-turn timer's last box destroys the quest. "Matching scarves" are one `CHOOSE_EFFECT` option per scarf whose knight and lady are in play (`matchingScarves`).

## Mechanics added for Foundations: Artisans

- Equipment: `CardState.equip` (the holder's keyword). Equipping is an `EQUIP` effect (an unlimited action, so the equipment is not discarded and the turn goes on); `GameState.equipped` maps equipment → holder while both are in play (`pruneEquipment` after each event). An equipped card is left out of selectors (except `equipped: true` or itself), produces nothing itself (`getCardProductionChoices` is empty for an `equip` state) and adds its production to its holder; its passives target `TargetScope.HOLDER`. It stays in play with its holder, is discarded / destroyed with it (`withEquipment`) and cannot be upgraded.
- `ADD_PRODUCTION_CHOICE` `choices: 'produced'` (+1 of a resource the card produces) or `'any'`.
- `PassiveType.GAIN_BEFORE_HOLDER_ACTION` (`actionEffects`, Ether Pearl): resolved before a ✓ / ⌛ action of the holder or of its equipment.
- `PassiveType.REPLACE_GAIN` (Jeweler, `resources` = from, to): productions and fixed `ADD_RESOURCES` gains of the first resource may be the second (`withGainReplacement`).
- `'any'` costs: `CardAction.amountLimits` (checked by the session) and `amountPer: 'all'` (the effects apply once); `ValuePerElement.paid` counts the amount paid (Statues: half the stone, `per: 2`).
- `GloryDef.gridBonus`: once 9 medals are written (in order), the bonus for each row, column and diagonal of 3 different values.
- `PassiveType.UPGRADED_ON_TOP_OF_DECK` (Architect): an upgraded card it selects goes on top of the deck instead of the discard pile (`leaveUpgradedCard`).
- A ✓ action discards its card before its effects: a card's own passive is gone while its ✓ effects resolve.

## Mechanics added for Foundations: Nobles

- Purge hooks: `SAVE_FROM_PURGE` with `keepGlory` keeps the card but counts its glory in the purge (`PurgeState.keptGloryIds`, Countess, Lady Elara); a purged `PURGE_MIN_GLORY` card makes each purged card worth at least its amount (Frostpeak, `getPurgeGlory`); `ADJUST_PURGE` passives of the permanents enlarge the purge batches when a campaign is selected (Starfall Castle).
- `CROSS_OUT_GLORY`: the chosen cards' current state is worth 0 (`CardInstance.crossedOutGloryStates`, Lady Elara).
- `REMOVE_RESOURCE_ON_CARD` with `stickerHere`: the source gets the sticker of the crossed out resource, from the stock (Lord Edric). `StickerSelector.producedByLastSelected` offers the stickers of what the last selected card produces (House of Stonehaven).
- `ValuePerElement.markedSteps` (boxes marked on the current state) and `plus` (added to the count, "its glory +7").
- `ActionEffect.keepSelection`: its target does not become `LAST_SELECTED`, so the next effects still act on the card chosen before (an effect on the card itself between them).
