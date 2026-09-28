# mynameisjonas.dev

## Common commands

- Deploy: push to `main`. Cloudflare Workers Builds deploys it; other branches get a preview URL. See `docs/adr/0002-workers-builds-previews.md`.
- Manual deploy (rarely needed): `pnpm run deploy` (not `pnpm deploy` — pnpm intercepts that as a workspace command)
- Test: `pnpm test`

## Agent skills

### Issue tracker

Issues live in GitHub Issues for this repo. See `docs/agents/issue-tracker.md`.

### Triage labels

Default canonical labels (`needs-triage`, `needs-info`, `ready-for-agent`, `ready-for-human`, `wontfix`). See `docs/agents/triage-labels.md`.

### Domain docs

Single-context layout — `CONTEXT.md` and `docs/adr/` at the repo root. See `docs/agents/domain.md`.