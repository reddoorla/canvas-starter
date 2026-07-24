# Autonomy contract

How the AI agent (Claude) operates on this repo with reduced human
intervention. The goal is to drive well-specified, high-level tasks PR-by-PR to
green **without per-step approval**, while keeping every unattended action
either reversible or caught by a gate before it can do harm.

This is a **behavioral contract**, not a security boundary. The
`.claude/settings.json` allowlist (see "Permissions" below) reduces prompt noise
and declares intent; it is not a sandbox. The binding controls are (a) the agent
following this contract, (b) CI being required on `main`, and (c) the
high-blast-radius actions — production deploys, secrets, Prismic model pushes —
sitting behind explicit gates, never an ad-hoc command.

Ported from the `reddoor-maintenance` autonomy contract (2026-07-02) and adapted
for this repo. This file, `docs/autonomy-journal.md`, and
`.claude/settings.local.json` are intentionally **untracked** (via
`.git/info/exclude`): reddoor-starter is the template new client sites are
generated from, and operator tooling must not ship with it. Watch out:
`.claude/settings.json` **is a tracked template file** in this repo — operator
config never goes in it.

## The model: autonomy scales with reversibility, not permissions

A bad merge to `main` is `git revert`. But this repo is the **template**: every
new client site is generated from `main`, and fleet patterns originate here
before `@reddoorla/maintenance` fans them out. A defect merged to `main` is
cleanly revertable in this repo — yet any client site generated in the window
inherits it silently. So `main` is held to CI-green + adversarial-review-clean,
and anything that leaves this repo (deploys, Prismic model pushes, fleet
fan-out) gets a stronger gate.

## Blast-radius tiers

### 🟢 GREEN — fully autonomous, no prompt

Local + reversible-remote. The agent does these freely:

- Edits, branches, commits, push to **feature** branches, PR **create**.
- **Merge of any PR** that is CI-green and adversarial-review-clean (see Merge
  authority) — including Renovate PRs.
- Reads of Prismic / GitHub / deployed sites; running builds, tests, lint,
  `svelte-check`, a11y tests, the review workflows.

### 🟡 YELLOW — autonomous behind a stronger gate, logged + reversible

- Behavior-changing `feat` merges — allowed unattended **only** when CI is green
  AND a 3-lens adversarial review is clean. Logged in the journal so the arc is
  reviewable after the fact.
- Major-version dependency bumps (this template's lockfile becomes every new
  site's baseline) — same gate as `feat`s.

### 🔴 RED — never autonomous (human checkpoint, every time)

- **Production deploys** (`netlify deploy`, Netlify site/env config changes).
  The agent touches production via PRs that CI/Netlify deploy on merge, never
  direct deploys.
- **Prismic schema mutations** (custom type / slice model changes) — whether via
  the Slice Machine UI, direct Custom Types API calls, or the Prismic MCP write
  tools (`mcp__prismic__save_slice_data`, `mcp__prismic__add_slice_to_custom_type`,
  both in `ask`). These mutate the live CMS schema outside git.
- Secrets (`gh secret set`, Prismic / Netlify / Turnstile tokens),
  branch-protection / org / billing changes.
- **Fleet-wide mutations** — this repo is where fleet patterns originate; any
  change fanned out to client repos lands as **per-repo PRs for review**, never
  an unattended mass push.
- History rewrites (force-push, `reset --hard` on shared branches), deletes of
  data the agent did not create.

## Merge authority (current policy: "everything but RED")

The agent may **auto-merge any PR** once it is CI-green and adversarial-review
clean — including behavior-changing `feat`s and Renovate majors — **except**
any PR that itself performs a RED action → **always human**.

Squash-merge, delete the branch, and append a journal entry. Patch/`fix` PRs
need no separate sign-off; `feat`s and majors get the 3-lens review before
merge.

**Never `gh pr merge --admin`.** Branch protection on `main` does not bind
admins (`enforce_admins` is off), so the required-CI gate only holds for the
agent's own merges if the agent never overrides it. An `--admin` merge is in
`ask`; enabling `enforce_admins` upstream would make the gate binding for real.

## Stop conditions — pause regardless of permissions

The agent stops and asks when it hits:

1. A genuine **product / direction / design fork** (what a feature _is_, which
   task matters) — these are not the agent's to decide.
2. Any **RED** action.
3. **CI failing > 2 times** on the same change without a clear fix — stop
   thrashing, report, and ask.
4. Anything that **deletes data or rewrites history**.
5. **Scope creep** beyond the agreed task — finish the scope, don't expand it
   unprompted.
6. A finding that contradicts how something was described (surface it, don't
   "fix" past it).

## The working loop

Every change follows the same loop, which is what makes broad merge authority
safe:

1. **TDD** — red test first, watch it fail, minimal green, refactor.
2. **Adversarial review** — fresh subagents/workflow review the diff across
   distinct lenses; **every real finding is folded in before merge**.
3. **Small, single-purpose PRs** — one concern each, so any one is revertable
   without unwinding the arc.
4. **Journal** — append what + why to
   [`docs/autonomy-journal.md`](docs/autonomy-journal.md) so the whole run is
   reviewable fast.

## Permissions & sandbox

`.claude/settings.local.json` (local-only, untracked via `.git/info/exclude` —
**not** `.claude/settings.json`, which is tracked template config here) encodes
these tiers as allow / ask / deny rules: GREEN commands are `allow`ed (a broad
`Bash(*)`, so command _shape_ — e.g. `&&`-chains — never reintroduces prompts);
RED commands are in `ask` (publish / deploy / secrets / Prismic schema writes /
`--admin` merges — forces a prompt, so they pause for a human while the operator
is away) or `deny` (force-push — including the `+refspec`, `--delete`, and
`:refspec` spellings — `reset --hard`, `rm -rf`, `.env` reads — blocked).

The OS-level **sandbox is enabled** (`sandbox.enabled: true`, macOS Seatbelt).
Sandboxed commands get filesystem access limited to **this repo** + caches
(`~/Library/pnpm`, `~/Library/Caches/ms-playwright`, `~/.npm`) — not the whole
GitHub dir, so a bad postinstall can't plant code in sibling fleet repos — with
credential reads denied (`~/.ssh`, `~/.aws`, `~/.prismic`), and network limited
to an allowlist (github, npm, `*.cdn.prismic.io` — the read API only, so the
Custom Types write API is unreachable from sandboxed commands —
cloudflare-turnstile, netlify).

**What it actually contains (the honest scope):** the primary supply-chain
vector — **`pnpm install` / `pnpm add`**, i.e. dependency **postinstall
scripts** — runs sandboxed, so an auto-merged Renovate dependency's install
hooks can't read `~/.ssh` / `~/.aws`, escape the workdir, or phone home
off-allowlist. That's the threat that matters for a Renovate-auto-merge repo.
The rest of the dev loop is in `excludedCommands` (runs **unsandboxed**),
because Seatbelt is incompatible with it:

- **`gh`, `git`** — Go-TLS fails under Seatbelt (`gh`), and the sandbox denies
  `.git/config` writes (breaks `git push -u`).
- **`pnpm dev` / `vite:dev` / `slicemachine` / `test` / `build` / `check` /
  `export:*` / `exec`, `node`, `npx`** — Vite and Slice Machine bind localhost
  ports (`listen` EPERM under Seatbelt), Playwright and md-to-pdf's headless
  Chrome write to `/tmp`; neither is allowlistable. These run our own trusted
  code, so unsandboxing them is acceptable (the supply-chain risk is the
  _install_, not our dev loop).

Limits (from the docs, not hedging): the sandbox is really **install-time
containment**, not full subprocess isolation; dependency code that runs at
_test/build_ time (not just install) is not contained. The proxy also filters by
hostname without TLS inspection (a broad allow like `github.com` is
domain-frontable), and `Bash(*)` lets the agent self-escape via
`dangerouslyDisableSandbox`. For a true hard wall — full isolation of all
dependency execution and the agent itself — run the whole agent in a dev
container / VM (the docs' own recommendation for unattended runs).
