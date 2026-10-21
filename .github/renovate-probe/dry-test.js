module.exports = {
  "requireConfig": "ignored",
  "onboarding": false,
  "dryRun": "full",
  "extends": [
    "github>reddoorla/.github:renovate-config",
    "github>reddoorla/canvas-starter//.github/renovate-probe/test-rules#claude/renovate-drought-probe"
  ],
  "force": {
    "schedule": [
      "at any time"
    ]
  }
};
