import type { AbandonKingdom } from '@application/kingdom/AbandonKingdom';
import type { CreateKingdom } from '@application/kingdom/CreateKingdom';
import type { DiscardLocalSave } from '@application/kingdom/DiscardLocalSave';
import type { RenameKingdom } from '@application/kingdom/RenameKingdom';
import type { SaveGame } from '@application/kingdom/SaveGame';
import type { AccountApi } from '@application/ports/AccountApi';
import type { AuthGateway } from '@application/ports/AuthGateway';
import type { KingdomRepository } from '@application/ports/KingdomRepository';
import type { Notifier } from '@application/ports/Notifier';
import type { Preferences } from '@application/ports/Preferences';
import type { SyncService } from '@application/sync/SyncService';
import type { GameCatalog } from '@deck-legacy/engine/domain/types';
import { createContext } from 'react';

/** What the UI may use, provided by the composition root (EDR-058): never the adapters themselves. */
export type AppServices = {
  /** Card, sticker, deck and expansion definitions bundled with the app. */
  catalog: GameCatalog;
  kingdoms: KingdomRepository;
  kingdomUseCases: {
    create: CreateKingdom;
    rename: RenameKingdom;
    abandon: AbandonKingdom;
    saveGame: SaveGame;
    discardLocalSave: DiscardLocalSave;
  };
  sync: SyncService;
  notifier: Notifier;
  preferences: Preferences;
  accountApi: AccountApi;
  auth: AuthGateway;
};

export const AppServicesContext = createContext<AppServices | null>(null);
