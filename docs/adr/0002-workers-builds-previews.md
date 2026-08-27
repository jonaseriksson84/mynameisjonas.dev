# Workers Builds for deploy and PR previews

Deploy is Cloudflare Workers Builds connected to this GitHub repo, not GitHub Actions.

- Push/merge to `main` runs `pnpm build` then `wrangler deploy` (production).
- Other branches run `pnpm build` then `wrangler versions upload` (preview URL on the PR, not live).
- GitHub Actions only runs `pnpm test`. It does not deploy and holds no Cloudflare token.

Preview versions of the Worker still bind the production D1 in wrangler.toml. Signup is therefore rejected unless the request host is `mynameisjonas.dev` or `www.mynameisjonas.dev`.
