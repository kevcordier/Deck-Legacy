/* global module */
/** @type {import('dependency-cruiser').IConfiguration} */
module.exports = {
  forbidden: [
    // ── Engine: Clean Architecture layers ────────────────────────────────────
    {
      name: 'domain-self-contained',
      comment: 'Domain layer must not import from other layers',
      severity: 'error',
      from: { path: '^packages/engine/src/domain' },
      to: { pathNot: '^packages/engine/src/domain' },
    },
    {
      name: 'application-only-domain',
      comment: 'Application layer may only import itself and the domain',
      severity: 'error',
      from: { path: '^packages/engine/src/application' },
      to: { pathNot: '^packages/engine/src/(application|domain)' },
    },

    // ── Packages never depend on apps ────────────────────────────────────────
    {
      name: 'packages-not-apps',
      comment: 'Shared packages must not import application code',
      severity: 'error',
      from: { path: '^packages/' },
      to: { path: '^apps/' },
    },

    // ── Game data only describes cards ───────────────────────────────────────
    {
      name: 'game-data-only-domain',
      comment: 'Card definitions may only use engine domain types and enums',
      severity: 'error',
      from: { path: '^packages/game-data/src' },
      to: { pathNot: '^packages/(game-data|engine/src/domain)/' },
    },

    // ── Apps share code only through packages ────────────────────────────────
    {
      name: 'apps-isolated',
      comment: 'Client and server only communicate over HTTP (shared code lives in packages/)',
      severity: 'error',
      from: { path: '^apps/(client|server)/' },
      to: { path: '^apps/(client|server)/', pathNot: '^apps/$1/' },
    },
  ],

  options: {
    doNotFollow: {
      path: 'node_modules',
    },
    exclude: {
      path: ['node_modules', '/dist/', 'apps/server/src/generated'],
    },
    tsPreCompilationDeps: true,
    tsConfig: {
      fileName: 'tsconfig.depcruise.json',
    },
    enhancedResolveOptions: {
      exportsFields: ['exports'],
      conditionNames: ['source', 'import', 'require', 'node', 'default'],
      extensions: ['.ts', '.tsx', '.js', '.mjs', '.cjs', '.json'],
    },
    reporterOptions: {
      text: {
        highlightFocused: true,
      },
    },
  },
};
