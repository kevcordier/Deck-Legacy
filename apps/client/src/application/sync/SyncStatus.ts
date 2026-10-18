export type SyncStatus =
  | 'signedOut' // no session yet: nothing is sent
  | 'syncing'
  | 'synced' // the server has the latest local saves
  | 'pending' // local changes not sent yet
  | 'offline' // the server could not be reached; retried later
  | 'rejected' // the server refused a save (cannot be replayed)
  | 'limited' // the server refused a new kingdom (kingdom limit reached)
  | 'conflict'; // another device synced a kingdom this device also changed
