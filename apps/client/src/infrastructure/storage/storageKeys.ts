/** Fixed keys of the app storage (kingdom saves use `saveKey(id)`). */
export const STORAGE_KEYS = {
  /** Single save of versions older than the kingdoms; migrated at startup. */
  legacySave: 'deck_legacy_save',
  kingdoms: 'deck_legacy_kingdoms',
  /** The player chose to play without an account. */
  offline: 'deck_legacy_offline',
  pendingAbandons: 'deck_legacy_pending_abandons',
  lang: 'deck_legacy_lang',
  tutorial: 'deck_legacy_tutorial',
  /** Warn before progressing while resources are in play (`false` = disabled). */
  resourceWarning: 'deck_legacy_resource_warning',
} as const;
