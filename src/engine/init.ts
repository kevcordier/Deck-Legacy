/**
 * @file init.ts
 * Initialisation du jeu et constructeurs d'événements de flux de tour.
 *
 * Responsabilités :
 * - Chargement des définitions depuis les fichiers JSON (cartes, stickers).
 * - Génération d'UIDs uniques pour les instances de carte.
 * - Construction des événements : GAME_STARTED, ROUND_STARTED, TURN_STARTED,
 *   TURN_ENDED, TRACK_ADVANCED.
 *
 * Ces fonctions sont pures : elles ne modifient pas l'état — elles renvoient
 * des objets `GameEvent` qui seront traités par le reducer.
 */

import type {
  CardDef,
  CardInstance,
  GameEvent,
  TurnEndReason,
  StickerDef,
  StickerStock,
} from './types';
import cardsData from '@data/cards.json';
import deckData from '@data/deck.json';
import stickersData from '@data/sticker.json';

// ─── Chargement ───────────────────────────────────────────────────────────────

/** Charge et indexe toutes les définitions de cartes depuis `cards.json` (clé = `card.id`). */
export function loadCardDefs(): Record<number, CardDef> {
  const defs: Record<number, CardDef> = {};
  for (const card of cardsData.cards as unknown as CardDef[]) {
    defs[card.id] = card;
  }
  return defs;
}

// Entrée du deck de départ (id unique + cardId)
export type DeckEntry = { id: number; cardId: number };

/** Charge et indexe les définitions de stickers depuis `sticker.json` (clé = `sticker.number`). */
export function loadStickerDefs(): Record<number, StickerDef> {
  const defs: Record<number, StickerDef> = {};
  for (const v of stickersData.stickers as unknown as StickerDef[]) {
    defs[v.number] = v;
  }
  return defs;
}

/** Retourne le stock global de stickers tel que défini dans `sticker.json`. */
export function loadInitialStickerStock(): StickerStock {
  return stickersData.globalStock as unknown as StickerStock;
}

// ─── UID ──────────────────────────────────────────────────────────────────────

let uidCounter = 0;

/**
 * Génère un UID unique pour une instance de carte.
 * Format : `c{cardId}s{stateId}_{counter}_{random3chars}`
 * Le compteur est global à la session ; `resetUidCounter` le remet à 0 avant chaque nouvelle partie.
 */
export function generateUid(cardId: number, stateId: number): string {
  return `c${cardId}s${stateId}_${++uidCounter}_${Math.random().toString(36).slice(2, 5)}`;
}

/** Remet le compteur d'UID à zéro. Appelé au démarrage d'une nouvelle partie pour des UIDs prévisibles. */
export function resetUidCounter(): void {
  uidCounter = 0;
}

// ─── Création d'instance ─────────────────────────────────────────────────────

/**
 * Crée une nouvelle instance de carte dans son état initial.
 * Les stickers, blocages et progression de piste sont tous à vide.
 */
export function createInstance(
  cardId: number,
  stateId: number,
  defs: Record<number, CardDef>,
): CardInstance {
  const def = defs[cardId];
  if (!def) throw new Error(`Card def not found: ${cardId}`);
  const state = def.states.find(s => s.id === stateId);
  if (!state) throw new Error(`State ${stateId} not found on card ${cardId}`);
  return {
    uid: generateUid(cardId, stateId),
    cardId,
    stateId,
    stickers: [],
    blockedBy: null,
    trackProgress: null,
    tags: [],
  };
}

// ─── Mélange Fisher-Yates ─────────────────────────────────────────────────────

/** Mélange un tableau en place (algorithme Fisher-Yates). Retourne une copie mélangée. */
export function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

// ─── GAME_STARTED ─────────────────────────────────────────────────────────────

/**
 * Construit l'événement `GAME_STARTED` pour initialiser une nouvelle partie.
 * - Deck de départ : les 10 premières entrées de `deck.json` (triées par id).
 * - Pile de découverte : les entrées restantes (id > 10), mélangées aléatoirement.
 * - Remet le compteur d'UIDs à zéro pour une reproductibilité maximale.
 */
export function buildGameStartedEvent(defs: Record<number, CardDef>): {
  event: GameEvent;
  starterInstances: CardInstance[];
  discoveryInstances: CardInstance[];
} {
  resetUidCounter();

  // Deck de départ : les 10 premières entrées de deck.json (par ordre d'id)
  const starterInstances: CardInstance[] = (deckData.deck as { id: number; cardId: number }[])
    .sort((a, b) => a.id - b.id)
    .slice(0, 10)
    .map(entry => ({
      ...createInstance(entry.cardId, defs[entry.cardId].states[0].id, defs),
      deckEntryId: entry.id,
    }));

  // Pile découverte : entrées deck.json avec id > 10, mélangées
  const discoveryInstances: CardInstance[] = shuffle(
    (deckData.deck as { id: number; cardId: number }[])
      .filter(e => e.id > 10)
      .sort((a, b) => a.id - b.id)
      .map(e => ({
        ...createInstance(e.cardId, defs[e.cardId].states[0].id, defs),
        deckEntryId: e.id,
      })),
  );

  return {
    event: {
      type: 'GAME_STARTED',
      payload: {
        initialInstances: starterInstances,
        discoveryInstances,
        stickerStock: loadInitialStickerStock(),
      },
    },
    starterInstances,
    discoveryInstances,
  };
}

// ─── ROUND_STARTED ───────────────────────────────────────────────────────────

/**
 * Construit l'événement `ROUND_STARTED`.
 * - Ajoute les 2 premières cartes de la pile de découverte (ou 0 si première manche).
 * - Sépare les nouvelles cartes permanentes du reste (ajouté au deck).
 * - Mélange deck + défausse + nouvelles cartes non-permanentes.
 */
export function buildRoundStartedEvent(
  round: number,
  deckUids: string[],
  discardUids: string[],
  currentPermanents: string[],
  addedCardUids: string[],
  instances: Record<string, CardInstance>,
  defs: Record<number, CardDef>,
): GameEvent {
  const newPermanents: string[] = [];
  const newDeckCards: string[] = [];

  for (const uid of addedCardUids) {
    const inst = instances[uid];
    if (defs[inst.cardId]?.permanent) newPermanents.push(uid);
    else newDeckCards.push(uid);
  }

  const allDeckUids = shuffle([...deckUids, ...discardUids, ...newDeckCards]);

  return {
    type: 'ROUND_STARTED',
    payload: {
      round,
      addedCards: addedCardUids.map(uid => instances[uid]),
      permanentUids: [...currentPermanents, ...newPermanents],
      deckUids: allDeckUids,
    },
  };
}

// ─── TURN_STARTED ────────────────────────────────────────────────────────────

/**
 * Construit l'événement `TURN_STARTED`.
 * Pioche `count` cartes (défaut : 4) depuis le sommet du deck.
 * Si le deck contient moins de `count` cartes, pioche tout le deck.
 */
export function buildTurnStartedEvent(turn: number, deck: string[], count: number = 4): GameEvent {
  const toDraw = Math.min(count, deck.length);
  const drawnUids = deck.slice(0, toDraw);
  const remainingDeck = deck.slice(toDraw);
  return { type: 'TURN_STARTED', payload: { turn, drawnUids, remainingDeck } };
}

// ─── TURN_ENDED ──────────────────────────────────────────────────────────────

/**
 * Construit l'événement `TURN_ENDED`.
 * Sépare les cartes du tableau en deux groupes :
 * - `persistedUids` : cartes ayant `stayInPlay` (état ou sticker) → restent au tableau.
 * - `discardedUids` : toutes les autres → vont en défausse.
 */
export function buildTurnEndedEvent(
  tableau: string[],
  instances: Record<string, CardInstance>,
  defs: Record<number, CardDef>,
  reason: TurnEndReason,
): GameEvent {
  const persistedUids = tableau.filter(uid => {
    const inst = instances[uid];
    if (!inst) return false;
    const state = defs[inst.cardId]?.states.find(s => s.id === inst.stateId);
    const fromState = state?.stayInPlay ?? false;
    const fromSticker = inst.stickers.some(
      v => v.effect.type === 'add_passive_effect' && (v.effect as any).effectId === 'reste_en_jeu',
    );
    return fromState || fromSticker;
  });
  const discardedUids = tableau.filter(uid => !persistedUids.includes(uid));
  return { type: 'TURN_ENDED', payload: { reason, discardedUids, persistedUids } };
}

// ─── TRACK_ADVANCED ──────────────────────────────────────────────────────────

/**
 * Construit l'événement `TRACK_ADVANCED` pour une carte ayant une piste de progression.
 * Calcule les paliers franchis entre `currentProgress` et la nouvelle position,
 * collecte leurs récompenses, et retourne `null` si aucun avancement n'est possible.
 */
export function buildTrackAdvancedEvent(
  cardUid: string,
  currentProgress: number | null,
  stepsToAdvance: number,
  defs: Record<number, CardDef>,
  instances: Record<string, CardInstance>,
): GameEvent | null {
  const instance = instances[cardUid];
  const def = defs[instance.cardId];
  const state = def?.states.find(s => s.id === instance.stateId);
  if (!state?.track) return null;

  const maxStep = state.track.steps.length - 1;
  const fromStep = currentProgress;
  const toStep = Math.min((fromStep ?? -1) + stepsToAdvance, maxStep);
  if (toStep === fromStep) return null;

  const startIdx = (fromStep ?? -1) + 1;
  const rewards = state.track.steps
    .filter(s => s.index >= startIdx && s.index <= toStep)
    .map(s => s.reward);

  return {
    type: 'TRACK_ADVANCED',
    payload: {
      cardUid,
      fromStep,
      toStep,
      stepsAdvanced: toStep - (fromStep ?? -1),
      rewards,
    },
  };
}
