/**
 * @file types.ts
 * Définitions TypeScript centrales du moteur de jeu.
 * Contient : types de données, interfaces de l'état, union des événements,
 * et fonctions utilitaires pures (sans effet de bord).
 */

// ─── Ressources ──────────────────────────────────────────────────────────────

/** Dictionnaire ressource → quantité. Ex: { gold: 2, wood: 1 } */
export type Resources = Record<string, number>;

// ─── Effets passifs ───────────────────────────────────────────────────────────

/**
 * Identifiants d'effets passifs permanents.
 * - `reste_en_jeu` : la carte reste dans le tableau en fin de tour au lieu d'aller en défausse.
 */
export type PassiveEffect = 'reste_en_jeu';

// ─── Stickers ────────────────────────────────────────────────────────────────

export type StickerEffect =
  | { type: 'resource'; resource: string; amount: number }
  | { type: 'glory_points'; amount: number }
  | { type: 'add_passive_effect'; effectId: PassiveEffect }
  | { type: 'add_tag'; tag: string };

export type StickerDef = {
  number: number;
  label: string;
  description: string;
  max: number;
  effect: StickerEffect;
};

export type StickerStock = Record<number, number>;

export type Sticker = {
  stickerNumber: number;
  effect: StickerEffect;
};

// ─── Piste d'avancée ─────────────────────────────────────────────────────────

export type TrackReward =
  | { type: 'resource'; resource: string; amount: number }
  | { type: 'sticker'; stickerNumber: number }
  | { type: 'glory_points'; amount: number }
  | { type: 'effect'; effectId: string };

export type TrackStep = {
  index: number;
  label: string;
  reward: TrackReward;
};

export type TrackDef = { steps: TrackStep[] };

// ─── Ciblage ─────────────────────────────────────────────────────────────────

export type TargetScope =
  | { scope: 'any' }
  | { scope: 'tableau' }
  | { scope: 'deck' }
  | { scope: 'discard' }
  | { scope: 'permanents' }
  | { scope: 'blocked' }
  | { scope: 'friendly' }
  | { scope: 'tagged'; tag: string; zone?: CardZone | 'all' };

// ─── Coût ────────────────────────────────────────────────────────────────────

export type DestroyTarget = 'self' | { cardId: number } | { tag: string };

export type Cost = {
  /** Coûts en ressources : `resources[0]` = coût fixe, les indices suivants sont réservés aux variantes. */
  resources?: Resources[];
  /** Cartes à défausser pour payer le coût (résolues une par une via `discard_for_cost`). */
  discard?: TargetScope[];
  /** Carte à détruire lors de l'utilisation (ex: coût de l'auto-destruction). */
  destroy?: DestroyTarget;
};

// ─── Choix de ressource ──────────────────────────────────────────────────────

// Un élément dans un tableau de choix de ressources
export type ResourceChoice =
  | Resources // ex: { gold: 1 }
  | { card: { card_scope: 'in_play' | 'tableau' | 'discard'; tags?: string[] } };

// ─── Effets d'action ─────────────────────────────────────────────────────────

export type ActionEffect =
  | { type: 'advance_track'; steps: number }
  | { type: 'add_to_deck'; cardId: number; position: 'top' | 'bottom' }
  | { type: 'discover'; count: number }
  | { type: 'block'; target: TargetScope }
  | { type: 'destroy'; target: TargetScope }
  | { type: 'add_resource'; resource: string | string[]; amount: number }
  | {
      type: 'add_resource';
      resource: string;
      amount_per_card: number;
      card_scope: 'in_play' | 'tableau' | 'deck' | 'discard';
      tags?: string[];
    }
  | { type: 'add_resources'; resources: ResourceChoice[] }
  | { type: 'sticker'; stickerNumber: number; target?: TargetScope }
  | { type: 'boost_production'; target?: TargetScope }
  | { type: 'discover_card'; number: number; cards: number[] }
  | { type: 'upgrade_card'; cardId: 'self' | number; upgradeTo: number }
  | { type: 'play_from_discard'; number: number; tags?: string[] }
  | { type: 'block_card'; number: number; produces?: string[]; tags?: string[] };

// ─── Définitions ─────────────────────────────────────────────────────────────

export type ActionDef = {
  /** Identifiant textuel de l'action (utilisé comme clé dans `computeResolveAction`). */
  label: string;
  cost?: Cost;
  effects: ActionEffect[];
  /** Si vrai, cette action termine le tour et déclenche immédiatement `TURN_ENDED` + `TURN_STARTED`. */
  endsTurn?: boolean;
  /** Si `'on_play'`, l'action se déclenche automatiquement quand la carte entre dans le tableau. */
  trigger?: 'on_play';
  /** Si `false`, le joueur DOIT choisir une cible valide ; l'action est ignorée si aucune cible n'est disponible. */
  optional?: boolean;
};

export type UpgradeDef = {
  cost: Cost;
  upgradeTo: number; // id d'un state dans la même carte
};

// ─── Passifs ─────────────────────────────────────────────────────────────────

export type CardPassiveEffect =
  | { type: 'can_discard_top_card' } // permet de défausser le sommet du deck sans défausser cette carte
  | {
      type: 'increase_production';
      target: 'self';
      resource: string;
      amount_per_card: number;
      card_scope: 'in_play' | 'tableau' | 'deck' | 'discard';
      tags?: string[];
    };

export type CardPassive = {
  label: string;
  effects: CardPassiveEffect[];
};

export type CardState = {
  id: number;
  name: string;
  /** Tags sémantiques (ex: "Terrain", "Ennemi") utilisés pour le ciblage et les effets conditionnels. */
  tags: string[];
  /**
   * Productions de ressources. 1 élément = production fixe, N éléments = le joueur choisit.
   * Ex: `[{ gold: 1 }]` ou `[{ wood: 1 }, { stone: 1 }]` (choix).
   */
  productions?: Resources[];
  /** Points de Gloire apportés par cette carte (comptés dans le score final). */
  glory?: number;
  /** Si vrai, la carte reste dans le tableau à la fin du tour (ne va pas en défausse). */
  stayInPlay?: boolean;
  /** Nombre maximum de stickers pouvant être appliqués sur cette carte. */
  maxStickers?: number;
  /** Piste de progression multi-étapes avec récompenses palier par palier. */
  track?: TrackDef;
  actions?: ActionDef[];
  /**
   * Définitions d'amélioration. 1 élément = upgrade automatique, N éléments = le joueur choisit.
   * L'upgrade termine le tour.
   */
  upgrade?: UpgradeDef[];
  passives?: CardPassive[];
  /** Alias français de `passives` (compatibilité données JSON). */
  passifs?: CardPassive[];
  /** Chemin relatif vers l'image de fond affichée dans le corps de la carte. */
  illustration?: string;
};

export type CardDef = {
  id: number;
  name: string;
  permanent?: boolean;
  chooseState?: boolean; // le joueur choisit l'état au moment de la découverte
  states: CardState[];
};

// ─── Instance de carte en jeu ─────────────────────────────────────────────────

/**
 * Représentation d'une carte physiquement présente dans la partie.
 * Une même définition (`CardDef`) peut avoir plusieurs instances en jeu simultanément.
 */
export type CardInstance = {
  /** Identifiant unique de cette instance (généré par `generateUid`). */
  uid: string;
  /** Référence vers la définition de carte dans `cards.json`. */
  cardId: number;
  /** Index de l'état actif parmi `CardDef.states` (détermine les effets en cours). */
  stateId: number;
  /** Référence à l'entrée dans `deck.json` (permet d'identifier les cartes du deck de départ). */
  deckEntryId?: number;
  /** Stickers actuellement collés sur cette carte (bonus de ressources, gloire, tags…). */
  stickers: Sticker[];
  /** UID de la carte qui bloque celle-ci, ou `null` si elle est libre. */
  blockedBy: string | null;
  /** Étape courante sur la piste de progression (null = piste non commencée). */
  trackProgress: number | null;
  /** Tags dynamiques ajoutés par des stickers (s'ajoutent aux tags de l'état). */
  tags: string[];
};

// ─── État du jeu ─────────────────────────────────────────────────────────────

/**
 * État complet de la partie à un instant donné.
 * Reconstruit de façon déterministe en rejouant tous les `GameEvent` depuis `EMPTY_STATE`.
 */
export type GameState = {
  /** UIDs des cartes dans le deck (ordre de pioche : index 0 = prochaine carte). */
  deck: string[];
  /** UIDs des cartes actuellement en jeu ce tour (posées devant le joueur). */
  tableau: string[];
  /** UIDs des cartes défaussées ce tour ou lors des tours précédents de la manche. */
  discard: string[];
  /** UIDs des cartes permanentes (persistent d'un tour à l'autre sans être défaussées). */
  permanents: string[];
  /** Registre central de toutes les instances de carte (y compris la pile de découverte). */
  instances: Record<string, CardInstance>;
  /** Ressources disponibles ce tour (remises à zéro à chaque nouveau tour). */
  resources: Resources;
  /** UIDs des cartes activées ce tour (une carte ne peut s'activer qu'une fois par tour). */
  activated: string[];
  /** Stock global de stickers restants, indexé par `stickerNumber`. */
  stickerStock: StickerStock;
  /** UIDs des cartes dans la pile de découverte (offertes en début de manche). */
  discoveryPile: string[];
  /** Numéro de manche courant (0 = partie non commencée). */
  round: number;
  /** Numéro de tour courant dans la manche. */
  turn: number;
  gameOver: boolean;
  /** Choix en attente de résolution par le joueur (bloque toute autre action). */
  pendingChoice: PendingChoice | null;
  /** UIDs des cartes ajoutées au début de la manche courante (pour les mettre en évidence). */
  lastAddedUids: string[];
};

export type CardZone = 'deck' | 'tableau' | 'discard' | 'permanents';
export type TurnEndReason = 'action' | 'upgrade' | 'voluntary' | 'no_cards';

// ─── Événements ──────────────────────────────────────────────────────────────

export type GameEvent =
  | {
      type: 'GAME_STARTED';
      payload: {
        initialInstances: CardInstance[];
        discoveryInstances: CardInstance[];
        stickerStock: StickerStock;
      };
    }
  | {
      type: 'ROUND_STARTED';
      payload: {
        round: number;
        addedCards: CardInstance[];
        permanentUids: string[];
        deckUids: string[];
      };
    }
  | { type: 'ROUND_ENDED'; payload: { round: number } }
  | {
      type: 'TURN_STARTED';
      payload: { turn: number; drawnUids: string[]; remainingDeck: string[] };
    }
  | {
      type: 'TURN_ENDED';
      payload: { reason: TurnEndReason; discardedUids: string[]; persistedUids: string[] };
    }
  | {
      type: 'CARD_ACTIVATED';
      payload: { cardUid: string; resourcesGained: Resources; discardedUid?: string };
    }
  | {
      type: 'ACTION_RESOLVED';
      payload: {
        activatedUids: string[];
        actionCardUid: string;
        actionId: string;
        cost: Cost;
        discardedUids: string[];
        costDiscardedUids?: string[];
        endsTurn: boolean;
        resourcesGained: Resources;
        upgradeEffect?: { cardUid: string; toStateId: number };
      };
    }
  | {
      type: 'UPGRADE_RESOLVED';
      payload: {
        activatedUids: string[];
        cardUid: string;
        fromStateId: number;
        toStateId: number;
        cost: Cost;
        discardedUids: string[];
      };
    }
  | { type: 'PROGRESSED'; payload: { drawnUids: string[]; remainingDeck: string[] } }
  | { type: 'CARD_BLOCKED'; payload: { blockerUid: string; targetUid: string } }
  | { type: 'CARD_UNBLOCKED'; payload: { blockerUid: string; targetUid: string } }
  | { type: 'CARD_DESTROYED'; payload: { cardUid: string; fromZone: CardZone } }
  | {
      type: 'CARD_DISCOVERED';
      payload: { instance: CardInstance; addedTo: 'permanents' | 'deck_top' | 'deck_bottom' };
    }
  | {
      type: 'CARD_STATE_CHOSEN';
      payload: {
        instance: CardInstance;
        chosenStateId: number;
        addedTo: 'permanents' | 'deck_top' | 'deck_bottom';
      };
    }
  | { type: 'ON_PLAY_TRIGGERED'; payload: { cardUid: string; actionLabel: string } }
  | { type: 'CARD_ADDED_TO_DECK'; payload: { instance: CardInstance; position: 'top' | 'bottom' } }
  | { type: 'STICKER_ADDED'; payload: { cardUid: string; sticker: Sticker } }
  | {
      type: 'TRACK_ADVANCED';
      payload: {
        cardUid: string;
        fromStep: number | null;
        toStep: number;
        stepsAdvanced: number;
        rewards: TrackReward[];
      };
    }
  | { type: 'UPGRADE_CARD_EFFECT'; payload: { cardUid: string; toStateId: number } }
  | { type: 'CARD_PLAYED_FROM_DISCARD'; payload: { cardUid: string } }
  | {
      type: 'CHOICE_MADE';
      payload:
        | { kind: 'discover_card'; actionCardUid: string; chosenCardIds: number[] }
        | { kind: 'choose_upgrade'; cardUid: string; chosenUpgradeTo: number };
    };

// ─── Helpers ─────────────────────────────────────────────────────────────────

/** Retourne l'état actif d'une instance (lève une erreur si la définition ou l'état est introuvable). */
export function getActiveState(instance: CardInstance, defs: Record<number, CardDef>): CardState {
  const def = defs[instance.cardId];
  if (!def) throw new Error(`Card def not found: ${instance.cardId}`);
  const state = def.states.find(s => s.id === instance.stateId);
  if (!state) throw new Error(`State ${instance.stateId} not found on card ${instance.cardId}`);
  return state;
}

/**
 * Retourne la liste dédupliquée des effets passifs actifs sur une instance :
 * ceux définis dans l'état (`stayInPlay`) + ceux accordés par des stickers.
 */
export function getEffectivePassiveEffects(
  instance: CardInstance,
  defs: Record<number, CardDef>,
): PassiveEffect[] {
  const state = getActiveState(instance, defs);
  const fromState: PassiveEffect[] = state.stayInPlay ? ['reste_en_jeu'] : [];
  const fromStickers = instance.stickers
    .filter(v => v.effect.type === 'add_passive_effect')
    .map(v => (v.effect as { type: 'add_passive_effect'; effectId: PassiveEffect }).effectId);
  return [...new Set([...fromState, ...fromStickers])];
}

export function hasEffect(
  instance: CardInstance,
  defs: Record<number, CardDef>,
  effect: PassiveEffect,
): boolean {
  return getEffectivePassiveEffects(instance, defs).includes(effect);
}

export function hasTag(instance: CardInstance, tag: string): boolean {
  return instance.tags.includes(tag);
}

/** Fusionne deux dictionnaires de ressources en additionnant les valeurs. Pur, sans mutation. */
export function mergeResources(a: Resources, b: Resources): Resources {
  const result = { ...a };
  for (const [k, v] of Object.entries(b)) {
    result[k] = (result[k] ?? 0) + v;
  }
  return result;
}

/** Vérifie si les ressources disponibles suffisent pour payer `cost.resources[0]`. */
export function canAffordCost(available: Resources, cost: Cost): boolean {
  if (!cost.resources?.[0]) return true;
  return Object.entries(cost.resources[0]).every(([k, v]) => (available[k] ?? 0) >= v);
}

/** Déduit `cost.resources[0]` des ressources disponibles. Supprime les clés tombées à 0. */
export function spendCost(available: Resources, cost: Cost): Resources {
  if (!cost.resources?.[0]) return available;
  const result = { ...available };
  for (const [k, v] of Object.entries(cost.resources[0])) {
    result[k] = (result[k] ?? 0) - v;
    if (result[k] <= 0) delete result[k];
  }
  return result;
}

/**
 * Résout un filtre de ciblage (`TargetScope`) en liste d'UIDs correspondants dans l'état courant.
 * Utilisé pour déterminer les cibles valides d'un effet ou d'un coût de défausse.
 */
export function resolveTargets(filter: TargetScope, state: GameState): string[] {
  switch (filter.scope) {
    case 'any':
      return [...state.deck, ...state.discard, ...state.tableau, ...state.permanents];
    case 'tableau':
      return state.tableau;
    case 'deck':
      return state.deck;
    case 'discard':
      return state.discard;
    case 'permanents':
      return state.permanents;
    case 'blocked':
      return [...state.tableau, ...state.permanents].filter(
        uid => state.instances[uid]?.blockedBy !== null,
      );
    case 'friendly':
      return [...state.tableau, ...state.permanents].filter(
        uid => !state.instances[uid]?.tags.includes('Enemy'),
      );
    case 'tagged': {
      const pool =
        !filter.zone || filter.zone === 'all'
          ? [...state.deck, ...state.discard, ...state.tableau, ...state.permanents]
          : (state[filter.zone] as string[]);
      return pool.filter(uid => state.instances[uid]?.tags.includes(filter.tag));
    }
  }
}

/**
 * Calcule le score total (Points de Gloire) de la partie courante.
 * Additionne `glory` de l'état actif + stickers `glory_points` de toutes les cartes
 * présentes dans deck, défausse, tableau et permanents.
 */
export function computeScore(state: GameState, defs: Record<number, CardDef>): number {
  const allUids = [...state.deck, ...state.discard, ...state.tableau, ...state.permanents];
  return allUids.reduce((total, uid) => {
    const instance = state.instances[uid];
    if (!instance) return total;
    const cs = getActiveState(instance, defs);
    const stickerGlory = instance.stickers
      .filter(v => v.effect.type === 'glory_points')
      .reduce((sum, v) => sum + (v.effect as { type: 'glory_points'; amount: number }).amount, 0);
    return total + (cs.glory ?? 0) + stickerGlory;
  }, 0);
}

// ─── Résultat d'une action (retour des fonctions pures du moteur) ─────────────

/**
 * Sentinelle retournée par les fonctions du moteur pour indiquer que `pendingChoice`
 * ne doit PAS être modifié (contrairement à `null` qui efface le choix courant).
 */
export const PENDING_UNCHANGED = 'unchanged' as const;

/**
 * Valeur de retour des fonctions pures du moteur.
 * - `events` : liste d'événements à appliquer via `dispatch`.
 * - `pendingChoice` : nouveau choix à afficher, `null` pour effacer, `PENDING_UNCHANGED` pour ne pas toucher.
 * - `resourceDelta` : ressources à ajouter directement sans passer par un événement (ex: copie de production).
 */
export type ActionResult = {
  events: GameEvent[];
  pendingChoice: PendingChoice | null | typeof PENDING_UNCHANGED;
  resourceDelta?: Resources;
};

// ─── Choix en attente (sélection joueur requise) ──────────────────────────────

export type PendingChoice =
  | {
      kind: 'discover_card';
      actionCardUid: string;
      actionLabel: string;
      candidates: number[];
      pickCount: number;
    }
  | {
      kind: 'choose_upgrade';
      cardUid: string;
      options: UpgradeDef[];
    }
  | {
      kind: 'play_from_discard';
      actionCardUid: string;
      candidates: string[];
      pickCount: number;
    }
  | {
      kind: 'choose_resource';
      source: 'activation' | 'action';
      cardUid: string;
      options: Resources[];
    }
  | {
      kind: 'choose_state';
      instance: CardInstance; // instance créée mais state pas encore fixé
      addedTo: 'permanents' | 'deck_top' | 'deck_bottom';
      options: CardState[]; // états disponibles au choix
      remaining?: Array<{
        instance: CardInstance;
        addedTo: 'permanents' | 'deck_top' | 'deck_bottom';
        options: CardState[];
      }>;
    }
  | {
      kind: 'copy_production';
      actionCardUid: string;
      candidates: string[];
    }
  | {
      kind: 'block_card';
      blockerUid: string;
      candidates: string[];
      actionLabel: string;
    }
  | {
      kind: 'discard_for_cost';
      actionCardUid: string;
      actionId: string;
      candidates: string[];
      remainingScopes: TargetScope[];
      collectedUids: string[];
    };
