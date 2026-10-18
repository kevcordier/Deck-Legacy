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
      to: { pathNot: '^packages/(game-data|engine/src/domain/(types|enums))/' },
    },

    // ── Server: layers inside each feature module (games, users, scores) ─────
    {
      name: 'server-domain-pure',
      comment:
        'A server domain does not use its adapters or Prisma (ESLint forbids Nest and zod there)',
      severity: 'error',
      from: { path: '^apps/server/src/[^/]+/domain/' },
      to: {
        path: [
          '^apps/server/src/[^/]+/(application|infrastructure|presentation)/',
          '^apps/server/src/(prisma|generated)/',
        ],
      },
    },
    {
      name: 'server-application-no-adapters',
      comment: 'Use cases depend on ports, never on infrastructure or controllers',
      severity: 'error',
      from: { path: '^apps/server/src/[^/]+/application/' },
      to: { path: '^apps/server/src/[^/]+/(infrastructure|presentation)/' },
    },
    {
      name: 'server-presentation-no-infrastructure',
      comment: 'Controllers call use cases, never repositories',
      severity: 'error',
      from: { path: '^apps/server/src/[^/]+/presentation/' },
      to: { path: '^apps/server/src/[^/]+/infrastructure/' },
    },

    // ── Client: domain ← application ← infrastructure / presentation (EDR-057) ──
    {
      name: 'client-domain-pure',
      comment: 'Client domain rules only use the engine and game data',
      severity: 'error',
      from: { path: '^apps/client/src/domain/' },
      to: { path: '^apps/client/src/(application|infrastructure|presentation|composition|app)/' },
    },
    {
      name: 'client-application-no-adapters',
      comment: 'Use cases depend on ports; only the generated API types come from infrastructure',
      severity: 'error',
      from: { path: '^apps/client/src/application/' },
      to: {
        path: '^apps/client/src/(infrastructure|presentation|composition|app)/',
        pathNot: '^apps/client/src/infrastructure/api/generated/',
      },
    },
    {
      name: 'client-infrastructure-no-ui',
      comment: 'Adapters never depend on the UI or the composition root',
      severity: 'error',
      from: { path: '^apps/client/src/infrastructure/' },
      to: { path: '^apps/client/src/(presentation|composition|app)/' },
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
      path: [
        'node_modules',
        '/dist/',
        'apps/server/src/generated',
        'apps/client/src/infrastructure/api/generated',
      ],
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
