import type { GameEvent, GameState } from './types'

const SAVE_KEY = 'chroniques_save'

export type SaveData = {
    events: GameEvent[]
    savedAt: number    // timestamp ms
    round: number
    turn: number
}

export function saveGame(events: GameEvent[], state: GameState): void {
    try {
        const data: SaveData = {
            events,
            savedAt: Date.now(),
            round: state.round,
            turn: state.turn,
        }
        localStorage.setItem(SAVE_KEY, JSON.stringify(data))
    } catch (e) {
        console.warn('Impossible de sauvegarder la partie', e)
    }
}

export function loadSave(): SaveData | null {
    try {
        const raw = localStorage.getItem(SAVE_KEY)
        if (!raw) return null
        return JSON.parse(raw) as SaveData
    } catch {
        return null
    }
}

export function deleteSave(): void {
    try {
        localStorage.removeItem(SAVE_KEY)
    } catch {
        // ignore
    }
}

export function hasSave(): boolean {
    return !!localStorage.getItem(SAVE_KEY)
}

export function formatSaveDate(savedAt: number): string {
    return new Intl.DateTimeFormat('fr-FR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
    }).format(new Date(savedAt))
}