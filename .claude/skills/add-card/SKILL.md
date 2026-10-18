---
name: add-card
description: Add a new card to Deck-Legacy — creates the CardDef file, registers it in the cards index, adds EN/FR locale strings, and wires it into deck.json (base deck, discovery or expansion). Use when the user wants to create, add or implement a new card.
argument-hint: '[card id] [card name / description of states]'
---

# Add a card

Arguments: `$ARGUMENTS` (card id and/or a description of the card; may be empty).

## 0. Gather the spec

Before writing code, make sure you know for **each state**: name, tags, productions, glory,
actions (cost, effects, trigger, `unlimited`/`endsTurn`/`optional`), passives, upgrade paths,
track steps, the `PERMANENT` tag, and the illustration file. Also: is it a parchment card
(`parchmentCard: true`, text in `texts.<cardId>`)? Where does it enter the game (initial
deck, discovered later by id, or an expansion)?

If anything essential is missing or ambiguous, ask the user — do not invent game rules.

## 1. Pick the id

- Default id = highest numbered file in `src/data/cards/` + 1 (`ls packages/game-data/src/cards | sort -n | tail -1`).
- If the user gives an id, check `packages/game-data/src/cards/<id>.ts` does not already exist.

## 2. Study similar cards first

Read `packages/game-data/src/cards/1.ts` and 1–2 existing cards that use the same mechanics
(`grep -l "ActionEffectType.TRACK_ADVANCE" packages/game-data/src/cards/*.ts`, etc.) and copy their
structure. Check `packages/engine/src/domain/enums` and `packages/engine/src/domain/types` for exact field
names — never guess a field.

## 3. Create `packages/game-data/src/cards/<id>.ts`

```ts
import { ActionEffectType, CardTag, ResourceType } from '@deck-legacy/engine/domain/enums';
import type { CardDef } from '@deck-legacy/engine/domain/types';

export const camelCaseName: CardDef = {
  id: <id>,
  name: '<English name of state 1>',
  states: [
    {
      id: 1,
      name: '<English state name>',
      tags: [CardTag.LAND],
      illustration: 'cards/<id>_1.jpg',
      productions: [{ [ResourceType.GOLD]: 1 }],
      actions: [ { id: '<id>-1-1', actionEffects: [ { id: 1, type: ActionEffectType.ADD_RESOURCES, ... } ] } ],
    },
  ],
};
```

Conventions (from existing cards — follow these, not older docs):

- Action and passive ids are **dash-separated**: `'<cardId>-<stateId>-<n>'` (e.g. `'121-2-1'`).
- `ActionEffect.id` is a number, unique within its action, starting at 1.
- State ids start at 1; `upgradeTo` / `states.ids` reference these state ids.
- Stay-in-play: `passives: [CardPassives[PassiveType.STAY_IN_PLAY]]` (import `CardPassives` from `@deck-legacy/engine/domain/types/effects`).
- Illustrations are referenced as `cards/<id>_<stateId>.<ext>` and the files live in `apps/client/assets/cards/` (bundled for offline play). After adding an image, run `pnpm --filter @deck-legacy/client generate:illustrations` (Metro only bundles images listed in `apps/client/src/data/illustrations.ts`). If the image does not exist yet, still set the path and tell the user which files to add.
- Use `import type` for types only; no `any`.

## 4. Register in `packages/game-data/src/cards/index.ts` (or the expansion's `index.ts`)

Add `import { camelCaseName } from './<id>';` after the last import and append
`camelCaseName,` at the end of the `cardsData` array.

## 5. Locales — `cards.en.json` AND `cards.fr.json` in `packages/game-data`

Base game cards: `src/locales/`. Expansion folder cards: `src/expansions/<name>/locales/` (EDR-043). Both files must get exactly the same keys, and a key lives in one file only. Sections and key formats:

| Section    | Key                                  | When                                         |
| ---------- | ------------------------------------ | -------------------------------------------- |
| `names`    | English state name (e.g. `"Plains"`) | every state name not already present         |
| `actions`  | action id `"<id>-<state>-<n>"`       | every action                                 |
| `actions`  | `"<actionId>-<effectId>"`            | each option of a `CHOOSE_EFFECT`             |
| `effect`   | `"<actionId>_<effectId>"`            | custom label for a pending choice (optional) |
| `passives` | passive id                           | every passive with a custom id               |
| `glory`    | `"<id>-<state>"`                     | conditional / per-element glory text         |
| `tracks`   | `"<id>-<state>-<stepId>"`            | every track step (empty string if no effect) |
| `texts`    | `"<id>"`                             | parchment card / description markdown        |
| `tags`     | tag value                            | only if a brand-new `CardTag` is introduced  |

Use icon placeholders in text: `{{gold}} {{wood}} {{stone}} {{iron}} {{weapon}} {{goods}}
{{glory}} {{time}} {{passif}} {{destroy}} {{trigger}} {{upgrade}} {{accumulated}}`.
`{{discovered}}` shows the number (with the expansion logo) of the cards the action discovers,
with a preview on hover: use it instead of writing the number, e.g. `Discover Sheriff ({{discovered}}).`

Resource amounts: 3 or fewer, repeat the icon (`Spend {{gold}}{{gold}} to…`); 4 or more, write the
number then one icon (`Spend 4 {{weapon}} to…`). Modifiers keep their number (`+1 {{gold}} production`,
`cross out 1 {{gold}}`). `locales.test.ts` checks it.
Match the tone of neighbouring entries ("End of round: …" / "Fin de manche : …").
Insert keys next to other keys of the same card id, keeping numeric order.

## 6. Wire it into the game (`packages/game-data/src/deck.json`)

Ask if unclear. A deck entry has three ids (EDR-047):

- `id`: the instance id, unique across the base game and every expansion (card selectors use it):
  max existing `id` in every `deck.json` + 1.
- `cardId`: the card definition (`cards/<cardId>.ts`), also unique across the whole game.
- `number` (expansions only): the number printed on the card, scoped to the expansion; the base
  game prints the instance id.

- **Campaign** (starting deck = cards 1–10, then discovered in order at the start of each round,
  EDR-045): add `{ "id": <instanceId>, "cardId": <id> }` to `campaign`.
- **Discoverable** (only by another card's `DISCOVER_CARD`): add it to `discoverable`; update the discovering card's effect and its locale text if needed.
- **Expansion** (EDR-042): the card lives in `src/expansions/<name>/cards/<id>.ts`, is listed
  in `src/expansions/<name>/index.ts`, and its instance goes in `src/expansions/<name>/deck.json`
  (`name`, `expansionMaxRound`, `purge` (with an optional `focus: { resource, count }`), `parameters`, `stickers` added to the stock,
  `campaign`, `discoverable`, `onStart.discover.ids`), each entry with its printed `number`.
  A new expansion folder is added to `expansionPacks` in `src/expansions/index.ts`, with a
  translated title in `campaign.expansions.<name>` (en/fr).
  Prosperity, The Water Mill and Border Dispute are base game mini campaigns, not expansions: their
  cards stay in `cards/` and their decks in `campaigns` of `deck.json`.

## 7. Engine support

If the card needs a mechanic the engine lacks (new `ActionEffectType`, `PassiveType`,
`Trigger`, `TargetScope`…), stop and tell the user: that is an engine change requiring a
new strategy in `packages/engine/src/domain/cardAction/`, registration in `CardActionContext`,
and full test coverage in `packages/engine/tests/application/`. Do it only with their agreement.

## 8. Verify

Run `pnpm verify` and fix every error/warning (zero-warning policy). `packages/game-data/tests/catalog.test.ts` checks that every deck entry references a known card and that instance ids are unique. `packages/game-data/tests/locales.test.ts` checks that EN and FR have the same keys in each file, that no key is defined twice, and that every state name is translated.

Card data is replayed by the server to validate synced games: never change the meaning of an
existing card in a way that would break already-played games without telling the user.

## 9. Report

Summarise: file created, states, where the card enters the game, locale keys added,
missing illustration files, and anything you had to assume.
