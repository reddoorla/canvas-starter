module.exports = {
  "requireConfig": "ignored",
  "onboarding": false,
  "extends": [
    "github>reddoorla/.github:renovate-config"
  ],
  "schedule": [
    "at any time"
  ],
  "branchPrefix": "probe/drought-test/",
  "branchPrefixOld": "probe/drought-test/",
  "dependencyDashboard": false,
  "dependencyDashboardTitle": "drought probe dashboard (never created)",
  "draftPR": true,
  "prHourlyLimit": 0,
  "prConcurrentLimit": 0,
  "branchConcurrentLimit": 0,
  "prHeader": "**Renovate drought proof, never merge.** A probe from reddoorla/reddoor-workspace `audits/2026-10-21-renovate-feature-drought/`. Draft, automerge off, outside the `renovate/` prefix.",
  "lockFileMaintenance": {
    "enabled": false
  },
  "vulnerabilityAlerts": {
    "enabled": false
  },
  "osvVulnerabilityAlerts": false,
  "packageRules": [
    {
      "matchUpdateTypes": [
        "minor",
        "patch"
      ],
      "prCreation": "immediate"
    },
    {
      "matchPackageNames": [
        "@reddoorla/maintenance",
        "sharp",
        "@zerodevx/svelte-img",
        "vite-imagetools",
        "imagetools-core",
        "@sveltejs/enhanced-img"
      ],
      "matchUpdateTypes": [
        "minor",
        "patch"
      ],
      "groupName": "held graph-reshaping packages",
      "groupSlug": "held-minor-patch"
    },
    {
      "matchUpdateTypes": [
        "major",
        "pin",
        "pinDigest",
        "digest",
        "rollback",
        "bump",
        "replacement"
      ],
      "enabled": false
    },
    {
      "matchUpdateTypes": [
        "minor",
        "patch"
      ],
      "automerge": false
    }
  ]
};
