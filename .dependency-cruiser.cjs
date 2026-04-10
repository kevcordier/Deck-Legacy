/* global module */
/** @type {import('dependency-cruiser').IConfiguration} */
module.exports = {
  forbidden: [
    // ── Domain must be self-contained ────────────────────────────────────────
    {
      name: 'domain-self-contained',
      comment: 'Domain layer must not import from Other layers',
      severity: 'error',
      from: { path: '^src/engine/domain' },
      to: { pathNot: '^src/engine/domain' },
    },

    // ── Application must not reach into Infrastructure ────────────────────────
    {
      name: 'application-no-import-from-other-than-domain',
      comment: 'Application layer must not import from Other layers except domain',
      severity: 'error',
      from: { path: '^src/engine/application', pathNot: '__tests__' },
      to: { pathNot: '^src/engine/(application|domain)' },
    },
  ],

  options: {
    doNotFollow: {
      path: 'node_modules',
    },
    tsConfig: {
      fileName: 'tsconfig.json',
    },
    enhancedResolveOptions: {
      exportsFields: ['exports'],
      conditionNames: ['import', 'require', 'node', 'default'],
    },
    reporterOptions: {
      text: {
        highlightFocused: true,
      },
    },
  },
};
