module.exports = {
  "requireConfig": "ignored",
  "onboarding": false,
  "extends": [
    "github>reddoorla/.github:renovate-config"
  ],
  "schedule": [
    "at any time"
  ],
  "dryRun": "full",
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
    }
  ]
};
