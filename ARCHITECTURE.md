# Architecture technique — Deck Legacy

## Vue d'ensemble

**Deck Legacy** est un jeu de cartes solo tour par tour jouable dans le navigateur.
Le joueur part d'un petit deck de départ, active des cartes pour produire des ressources, dépense ces ressources pour déclencher des actions, améliore ses cartes et élargit son deck manche après manche. L'objectif est de maximiser ses **Points de Gloire** en fin de partie.

**Stack technique :** React 19 · TypeScript · Vite · i18next (FR/EN)

---

## Structure du projet

```
src/
├── engine/          # Moteur de jeu pur (zéro dépendance React)
│   ├── types.ts         # Types, interfaces, fonctions utilitaires
│   ├── reducer.ts       # Reducer (GameState, GameEvent) → GameState
│   ├── init.ts          # Builders d'événements, chargement des données
│   ├── turnFlow.ts      # Flux de tour/manche (startRound, startTurn…)
│   ├── cardActions.ts   # Activation, actions, upgrades
│   ├── choiceHandlers.ts# Résolution des choix joueur
│   ├── persistence.ts   # Sauvegarde/chargement localStorage
│   └── index.ts         # Exports publics du moteur
│
├── hooks/
│   └── useGame.ts       # Hook React : pont entre UI et moteur
│
├── components/          # Composants React
│   ├── GameBoard/       # Conteneur principal du jeu
│   ├── GameCard/        # Affichage d'une carte jouable
│   ├── PendingChoiceModal/  # Modal pour tous les choix interactifs
│   ├── ResourceBar/     # Barre de ressources / score
│   ├── DeckViewer/      # Aperçu du deck restant
│   ├── DiscardPile/     # Aperçu de la défausse
│   ├── EventLog/        # Historique interactif des événements
│   ├── CardListModal/   # Liste de toutes les cartes
│   ├── CardStatePreview/# Tooltip des états alternatifs
│   ├── OptionsModal/    # Paramètres (langue, reset)
│   ├── GameOverScreen/  # Écran de fin de partie
│   ├── CardRow/         # Ligne horizontale de cartes
│   ├── Section/         # Conteneur de section
│   ├── EmptyState/      # Placeholder zone vide
│   └── Resource/        # ResourcePill, ResourceList, ResourceChoice
│
├── helpers/
│   ├── cardHelpers.ts       # Calcul des productions effectives
│   ├── resourceHelpers.ts   # Métadonnées des ressources (icônes, couleurs)
│   └── renderHelpers.tsx    # Remplacement {{token}} → icône SVG dans le texte
│
├── i18n/
│   ├── i18n.ts          # Configuration i18next
│   ├── cardI18n.ts      # Traductions des noms et textes de cartes
│   └── locales/         # Fichiers JSON de traduction (en, fr)
│
├── data/
│   ├── cards.json       # Définitions de toutes les cartes
│   ├── deck.json        # Deck de départ + pile de découverte
│   └── sticker.json     # Définitions des stickers + stock global
│
└── styles/              # CSS global et utilitaires
    ├── game.css
    ├── animations.css
    ├── base.css
    ├── buttons.css
    └── tag.css
```

---

## Architecture du moteur — Event Sourcing

Le moteur repose sur le pattern **Event Sourcing** :

```
Action joueur
      │
      ▼
Fonction pure du moteur
(turnFlow / cardActions / choiceHandlers)
      │
      ▼
ActionResult { events[], pendingChoice, resourceDelta? }
      │
      ▼
useGame.applyResult()  ─── dispatch chaque événement ──▶  reducer(state, event) → newState
                        └── applique pendingChoice / resourceDelta directement sur liveState
      │
      ▼
Sauvegarde auto localStorage (si pendingChoice === null)
      │
      ▼
Composants React re-rendent depuis le nouvel état
```

### Avantages

- **Déterminisme** : l'état complet se reconstruit en rejouant tous les événements depuis `EMPTY_STATE` (`replayEvents`).
- **Rembobinage** : `stateAtIndex(events, n)` retourne l'état à n'importe quel point de l'historique.
- **Testabilité** : toutes les fonctions du moteur sont pures (entrée → sortie, sans effet de bord).
- **Sauvegarde robuste** : seule la liste d'événements est persistée — pas de snapshot d'état à versionner.

---

## État du jeu (`GameState`)

```typescript
{
  deck: string[]          // UIDs ordonnés (index 0 = prochaine pioche)
  tableau: string[]       // Cartes posées ce tour
  discard: string[]       // Cartes défaussées
  permanents: string[]    // Cartes qui persistent d'un tour à l'autre
  instances: Record<string, CardInstance>  // Toutes les instances (y compris pile de découverte)
  resources: Resources    // { gold: 2, wood: 1, … } — remis à zéro chaque tour
  activated: string[]     // UIDs activés ce tour
  stickerStock: Record<number, number>     // Stock global de stickers
  discoveryPile: string[] // UIDs des cartes proposées en début de manche
  round: number           // Manche courante (0 = avant démarrage)
  turn: number            // Tour courant dans la manche
  gameOver: boolean
  pendingChoice: PendingChoice | null      // Bloque toute action tant que non null
  lastAddedUids: string[] // Cartes ajoutées au début de la manche (mise en évidence UI)
}
```

### Instance de carte (`CardInstance`)

```typescript
{
  uid: string          // Identifiant unique généré à la création
  cardId: number       // Référence vers CardDef (cards.json)
  stateId: number      // État actif (chaque carte peut avoir plusieurs états)
  stickers: Sticker[]  // Bonus collés (ressources, gloire, tags, passifs)
  blockedBy: string | null  // UID du bloqueur (null = libre)
  trackProgress: number | null  // Palier courant sur la piste de progression
  tags: string[]       // Tags dynamiques ajoutés par des stickers
}
```

---

## Événements (`GameEvent`)

Tous les changements d'état passent par un événement. Union discriminée :

| Événement | Déclenché par |
|---|---|
| `GAME_STARTED` | Démarrage d'une nouvelle partie |
| `ROUND_STARTED` | Début de manche (mélange, ajout cartes) |
| `ROUND_ENDED` | Fin de manche |
| `TURN_STARTED` | Pioche de 4 cartes |
| `TURN_ENDED` | Fin de tour (défausse tableau) |
| `CARD_ACTIVATED` | Activation d'une carte (production ressources) |
| `ACTION_RESOLVED` | Résolution d'une action de carte |
| `UPGRADE_RESOLVED` | Amélioration d'une carte |
| `PROGRESSED` | Pioche de 2 cartes supplémentaires |
| `CARD_BLOCKED` | Blocage d'une carte |
| `CARD_UNBLOCKED` | Libération automatique d'un blocage |
| `CARD_DESTROYED` | Destruction d'une carte |
| `CARD_DISCOVERED` | Ajout d'une carte depuis la pile de découverte |
| `CARD_STATE_CHOSEN` | Choix d'état lors d'une découverte |
| `CARD_ADDED_TO_DECK` | Ajout direct d'une carte dans le deck |
| `CARD_PLAYED_FROM_DISCARD` | Rejouer une carte depuis la défausse |
| `STICKER_ADDED` | Pose d'un sticker sur une carte |
| `TRACK_ADVANCED` | Avancement sur la piste de progression |
| `UPGRADE_CARD_EFFECT` | Upgrade déclenché comme effet d'action |
| `ON_PLAY_TRIGGERED` | Notification d'un déclencheur on_play |
| `CHOICE_MADE` | Confirmation d'un choix de découverte |

---

## Mécaniques de jeu

### Boucle principale

```
[Début manche]
   Mélange deck + défausse + 2 nouvelles cartes
   ↓
[Début tour]
   Pioche 4 cartes → tableau
   ↓
[Phase joueur]
   ├── Activer des cartes        → ressources
   ├── Déclencher des actions    → effets, coûts, choix
   ├── Améliorer une carte       → fin de tour automatique
   └── Fin de tour volontaire
   ↓
[Fin tour]
   Cartes sans stayInPlay → défausse
   Cartes avec stayInPlay → restent au tableau
   ↓
   Deck vide ? → Fin de manche → Début manche suivante
             : → Début tour suivant
```

### Activation de carte

Une carte s'active une fois par tour. Elle produit ses ressources de base, augmentées par :
- Les bonus de stickers (`resource`).
- Les effets passifs `increase_production` (compte d'autres cartes en jeu avec certains tags).

Si plusieurs options de production existent, le joueur choisit via `choose_resource`.
Les cartes non-permanentes sont défaussées immédiatement après activation.

### Actions

Les actions sont définies dans `CardState.actions[]`. Chaque action possède :
- Un `label` (identifiant unique dans l'état).
- Un `cost` optionnel (ressources et/ou défausses).
- Des `effects[]` (voir tableau ci-dessous).
- `endsTurn` : si vrai, termine le tour après résolution.
- `trigger: 'on_play'` : se déclenche automatiquement quand la carte entre dans le tableau.

#### Types d'effets

| Effet | Description |
|---|---|
| `add_resource` | Ajoute des ressources (fixes ou par nombre de cartes) |
| `add_resources` | Ressources à choix multiples ou copie de production |
| `discover` | Propose N cartes de la pile de découverte |
| `discover_card` | Propose une liste précise de cartes |
| `block` | Bloque une carte cible |
| `block_card` | Blocage avec filtre de production (on_play) |
| `destroy` | Détruit une carte d'une zone |
| `sticker` | Pose un sticker sur une carte cible |
| `advance_track` | Avance la piste de progression |
| `play_from_discard` | Rejoue des cartes depuis la défausse |
| `upgrade_card` | Upgrade une carte comme effet (sans interaction) |
| `boost_production` | Copie la production d'une autre carte |

### Stickers

Les stickers sont des bonus physiques posés sur les cartes. Chaque carte a un `maxStickers`. Le stock global est fini (`stickerStock`).

Types de stickers :
- `resource` : bonus de production fixe.
- `glory_points` : points de gloire additionnels.
- `add_passive_effect` : ajoute un effet passif (ex: `reste_en_jeu`).
- `add_tag` : ajoute un tag dynamique à la carte.

### Piste de progression (`track`)

Certaines cartes ont une piste multi-paliers. Chaque palier a un `index` et une `reward` (ressource, sticker ou gloire). En avançant la piste, tous les paliers franchis accordent leur récompense.

### Choix en attente (`PendingChoice`)

Quand une action nécessite une décision du joueur, le moteur retourne un `PendingChoice` qui suspend toute autre interaction. Les types possibles :

| Kind | Déclencheur |
|---|---|
| `discover_card` | Effet `discover` ou `discover_card` |
| `choose_upgrade` | Carte avec plusieurs options d'upgrade |
| `choose_state` | Carte découverte avec `chooseState: true` |
| `choose_resource` | Activation avec productions multiples, ou effet `add_resource` avec choix |
| `copy_production` | Effet `add_resources` avec cible `card` |
| `block_card` | Action `on_play` avec effet `block_card` |
| `play_from_discard` | Effet `play_from_discard` |
| `discard_for_cost` | Coût d'action avec `discard` (collecte une carte à la fois) |

---

## Hook `useGame`

`useGame` est le seul pont entre l'UI et le moteur. Il expose :

```typescript
{
  // État et données
  state: GameState
  events: GameEvent[]
  defs: Record<number, CardDef>
  stickerDefs: Record<number, StickerDef>
  score: number
  canDiscardTopCard: boolean
  hasSave: boolean

  // Cycle de vie
  startGame()
  startRound()
  startTurn()
  loadGame()
  deleteSave()

  // Actions joueur
  activateCard(uid, chosenResource?)
  resolveAction(uid, actionId)
  resolveUpgrade(uid, chosenUpgradeTo?)
  progress()
  endTurnVoluntary()
  discardTopCard()

  // Résolution de choix
  resolveChoice(cardIds)
  resolveChooseState(stateId)
  resolveResourceChoice(resources)
  resolveCopyProduction(targetUid)
  resolveBlockCard(targetUid)
  resolvePlayFromDiscard(uids)
  resolveDiscardCost(uid)
  cancelDiscardCost()

  // Historique
  currentTurnStartIndex: number
  rewindToEvent(index)
}
```

---

## Hiérarchie des composants

```
App
└── GameBoard                  ← orchestrateur principal, gère les phases de jeu
    ├── ResourceBar             ← ressources courantes + score + round/turn
    ├── Section (Permanents)
    │   └── CardRow
    │       └── GameCard        ← carte interactive (activation, actions, upgrade)
    │           └── CardStatePreview  ← tooltip états alternatifs
    ├── Section (Tableau)
    │   └── CardRow
    │       └── GameCard
    ├── DeckViewer              ← taille deck + aperçu sommet
    ├── DiscardPile             ← taille défausse + aperçu
    ├── PendingChoiceModal      ← modal bloquant pour tous les PendingChoice
    ├── CardListModal           ← navigation dans toutes les cartes
    ├── EventLog                ← historique des événements avec rembobinage
    └── OptionsModal            ← langue, reset
        GameOverScreen          ← affiché quand state.gameOver
```

---

## Données JSON

### `cards.json`

```json
{
  "cards": [{
    "id": 1,
    "name": "Prairie",
    "states": [{
      "id": 1,
      "name": "Herbe Sauvage",
      "tags": ["Terrain"],
      "productions": [{ "wood": 1 }],
      "glory": 0,
      "maxStickers": 2,
      "actions": [...],
      "upgrade": [{ "cost": { "resources": [{ "gold": 2 }] }, "upgradeTo": 2 }],
      "illustration": "/cards/prairie.png"
    }, {
      "id": 2,
      "name": "Prairie",
      "tags": ["Terrain"],
      "productions": [{ "wood": 1, "gold": 1 }],
      "glory": 1,
      ...
    }]
  }]
}
```

### `deck.json`

```json
{
  "deck": [
    { "id": 1, "cardId": 5 },   // id 1-10 : deck de départ
    ...
    { "id": 11, "cardId": 12 },  // id > 10 : pile de découverte (mélangée)
    ...
  ]
}
```

### `sticker.json`

```json
{
  "stickers": [{
    "number": 1,
    "label": "+1 Or",
    "description": "Produit 1 Or supplémentaire",
    "max": 3,
    "effect": { "type": "resource", "resource": "gold", "amount": 1 }
  }],
  "globalStock": { "1": 5, "2": 3, ... }
}
```

---

## Internationalisation (i18n)

Le projet supporte le **français** et l'**anglais** via `i18next`.

- `src/i18n/locales/fr.json` / `en.json` : textes d'interface.
- `src/i18n/locales/cards.fr.json` / `cards.en.json` : noms, descriptions et textes d'action des cartes.
- `src/i18n/cardI18n.ts` : fonctions `getCardName()`, `getActionLabel()`, `getPassiveText()`…

Le changement de langue est disponible depuis `OptionsModal` et redémarre l'interface sans recharger la partie.

---

## Sauvegarde

La partie est sauvegardée automatiquement dans `localStorage` (clé `deck_legacy_save`) à chaque fois que `pendingChoice === null` (état stable).

La sauvegarde contient :
- `events: GameEvent[]` — l'historique complet.
- `round`, `turn` — pour affichage rapide sans rejouer.
- `pendingChoice` — restauré tel quel car non inclus dans les événements.

Au chargement, `replayEvents(save.events, defs, stickerDefs)` reconstruit l'état complet.

---

## Patterns architecturaux clés

| Pattern | Application |
|---|---|
| **Event Sourcing** | Tout l'état dérive d'une liste d'événements immuables |
| **Reducer pur** | `(GameState, GameEvent) → GameState` sans mutation |
| **Separation of Concerns** | Moteur pur vs UI React vs données JSON |
| **Composition** | Composants React fonctionnels sans héritage |
| **Memoization** | `useMemo` / `useCallback` pour éviter les recalculs inutiles |
| **Dependency Injection** | `defs` et `stickerDefs` passés en paramètre aux fonctions du moteur |
