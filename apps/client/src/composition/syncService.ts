import { kingdomStore } from './kingdomStore';
import { SyncService } from '@application/sync/SyncService';
import { api } from '@infrastructure/api/api';

/** Background sync of this device's kingdoms with the API. */
export const syncService = new SyncService(api, kingdomStore);
