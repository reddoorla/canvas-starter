module.exports = {
  "requireConfig": "ignored",
  "onboarding": false,
  "extends": [
    "github>reddoorla/.github:renovate-config",
    "github>reddoorla/canvas-starter//.github/renovate-probe/test-rules#claude/renovate-drought-probe",
    "github>reddoorla/canvas-starter//.github/renovate-probe/real-rules#claude/renovate-drought-probe"
  ],
  "prHeader": "**Renovate drought proof, never merge.** A probe from reddoorla/reddoor-workspace `audits/2026-10-21-renovate-feature-drought/`. Draft, automerge off, outside the `renovate/` prefix.",
  "force": {
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
    "lockFileMaintenance": {
      "enabled": false
    },
    "vulnerabilityAlerts": {
      "enabled": false
    },
    "osvVulnerabilityAlerts": false
  }
};
