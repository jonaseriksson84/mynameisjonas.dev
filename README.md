# mynameisjonas.dev

Source for [mynameisjonas.dev](https://mynameisjonas.dev) — my personal site and blog.

## Stack

- [Astro 6](https://astro.build) — mostly static, with one server-rendered route for newsletter signup
- [Tailwind CSS v4](https://tailwindcss.com)
- [Cloudflare Workers](https://workers.cloudflare.com) for hosting
- [Cloudflare D1](https://developers.cloudflare.com/d1/) for newsletter subscribers
- TypeScript

## Layout

- `src/pages/` — routes (home, blog, projects, CV, `/api/subscribe`)
- `src/content/blog/` — Markdown posts with a Zod-validated frontmatter schema (standalone, series part, or book review)
- `src/lib/` — domain logic (series grouping, subscription recording, theme)
- `src/components/` — Astro components
- `CONTEXT.md` — domain language
- `docs/adr/` — architecture decisions

## Deploy

Production is the `mynameisjonas-dev` Worker. Local: `pnpm deploy`.

CI is Cloudflare Workers Builds (git connected to this repo):

- `main` → build + `wrangler deploy`
- other branches → build + `wrangler versions upload` (PR preview URL)

GitHub Actions only runs tests. Newsletter signup is disabled on preview hosts so PR deploys cannot write to the production D1.
