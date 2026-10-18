---
name: verify-mynameisjonas
description: Drive the built mynameisjonas.dev site in headless Chromium against a local Cloudflare Worker and a disposable D1. Use when a change to a page, the newsletter route, transfer size, or Lighthouse numbers needs proof from the running build.
---

# Verify mynameisjonas.dev

The site is an Astro 6 static build with one Worker route, `POST /api/subscribe`. A user reads `/`, `/blog`, `/blog/<slug>`, `/projects`, `/cv`, and `/cv/print`, and can submit the newsletter form on a Gas City post. This skill serves the production build locally and drives it in Chromium. Run every command from the repo root.

`astro build` writes the Worker to `dist/server/entry.mjs` and static files to `dist/client`. `dist/server/wrangler.json` points the Worker at that entry, serves `dist/client` through the `ASSETS` binding, and binds D1 as `DB`. Launch runs `wrangler dev --config dist/server/wrangler.json --local` with `--persist-to` set to a private directory. That is the built Worker in workerd, including `/api/subscribe`. `astro preview` boots the same build through Vite and stores Miniflare state in the repo `.wrangler/state`, with no flag for a private directory, so two previews share one D1. `astro dev` serves source, not the build.

Signup writes a row only when the request host is `mynameisjonas.dev` or `www.mynameisjonas.dev` (`src/lib/subscription.ts`). This skill refuses those hosts. Local signup returns 403 `Signup is disabled on preview` and does not touch D1.

Two runs can proceed together when each has its own `VERIFY_RUN_ID`. Each id gets its own port and its own directory under `/tmp/verify-mynameisjonas/<id>/`. A second `launch` without `VERIFY_RUN_ID` overwrites `/tmp/verify-mynameisjonas/latest`.

## Launch

One-time, before the first `open`:

```bash
pnpm exec playwright install chromium
```

Start a run:

```bash
./.cursor/skills/verify-mynameisjonas/verify-mynameisjonas.mjs launch
```

Launch runs `pnpm run build`, applies `migrations/0001_create_subscribers.sql` with `wrangler d1 migrations apply mynameisjonas-subscribers --local --persist-to <run>/persist` (the built config lives in `dist/server` and would not see `migrations/`), then starts the Worker on `127.0.0.1` at a free port. Readiness is `GET /` returning 200 HTML that contains `mynameisjonas` and `Jonas`. The subscribers table exists and is empty. No account token is required. The command prints `VERIFY_RUN_ID`. Later commands in another shell need that id in the environment; the same shell can omit it and the helper reads `latest`.

`launch` refuses to start when that id's worker pid is still alive. Run cleanup first.

## Doctor

```bash
./.cursor/skills/verify-mynameisjonas/verify-mynameisjonas.mjs doctor
```

Doctor exits 0 only when the recorded worker pid is alive, its command line contains `dist/server/wrangler.json` and this run's persist directory, `GET /` is 200 HTML with the marker above, and `GET /favicon.svg` is 200. It does not click, post, or write. Drive only a run whose doctor just exited 0.

## Drive

Follow one file in `features/`. Commands:

```bash
./.cursor/skills/verify-mynameisjonas/verify-mynameisjonas.mjs open /blog
./.cursor/skills/verify-mynameisjonas/verify-mynameisjonas.mjs expect-heading Blog
./.cursor/skills/verify-mynameisjonas/verify-mynameisjonas.mjs click link "00 Installation and setup"
./.cursor/skills/verify-mynameisjonas/verify-mynameisjonas.mjs expect-path /blog/gas-city/00-setup/
./.cursor/skills/verify-mynameisjonas/verify-mynameisjonas.mjs capture post-page
```

`open` and `click` use accessible roles and exact names. The browser viewport is 1280×800, headless Chromium, cache disabled, so transfer bytes are a cold load. `open` waits for the load event. That event waits on the Google Fonts stylesheet, so a network that cannot reach `fonts.googleapis.com` makes `open` time out. A page such as `/blog` answers 307 to the trailing-slash URL; `open` follows that hop and stores it on the document request. `open /` does not redirect.

Do not click links whose URL host is not `127.0.0.1`. The browser aborts `mynameisjonas.dev` and `www.mynameisjonas.dev`. Footer and home-hero links pick up a CSS `> ` prefix in their accessible name (`> blog`, `> github`). Nav links do not (`Blog`, `CV`). Prose `h2` names include a leading `## `.

Other routes that respond: `/projects`, `/history-shorts`, `/cv/print`, `/blog/gas-city`, `/rss.xml`, `/sitemap-index.xml`, `/robots.txt`. `fetch` of an unknown path returns 404 and the not-found page.

Newsletter proof uses `verify-local@example.com` against the local base URL, then `subscribers`. The visible failure string is `Something went wrong. Please try again.` The 403 body is `Signup is disabled on preview`.

Lighthouse, when a change is about weight or LCP:

```bash
./.cursor/skills/verify-mynameisjonas/verify-mynameisjonas.mjs lighthouse /blog/gas-city/00-setup/
```

Desktop preset, performance category only. It launches its own Chromium and blocks the production hosts.

## Evidence

Artifacts stay under `/tmp/verify-mynameisjonas/<id>/evidence/`.

- `navigations/<slug>.json` — document status and headers, per-request transfer bytes, content-length, resource timing. Written by `open` and `click`.
- `<feature>/screenshot.png`, `aria.yaml`, `document.json`, `requests.json`, `summary.json`, `transfers.txt` — written by `capture <feature>`.
- `lighthouse/<slug>.json` and `<slug>.summary.json` — performance score (0–100), LCP milliseconds, CLS, total bytes.
- `fetch/<slug>.json` — status, headers, byte length, sha256. Text bodies up to 256 KiB are included. Images are not.
- `subscribers.json` — rows from the local D1. Empty is the expected proof.
- `failures/*.aria.yaml` — snapshot from a missed role or heading.

`transferBytes` is the Chrome DevTools encoded length (headers included). `content-length` is the asset body. The Gas City cover `/blog/gas-city/cover-00.png` is the large PNG on both `/blog` and part 0. Google Fonts load from `fonts.googleapis.com` and `fonts.gstatic.com` and count in the total.

## Cleanup

```bash
./.cursor/skills/verify-mynameisjonas/verify-mynameisjonas.mjs cleanup
```

Cleanup sends `SIGTERM`, then `SIGKILL`, to the recorded worker and browser pids, and only after the command line still matches this run. It does not signal a process by name. Evidence, the wrangler log, and the local D1 files stay in the run directory. Run cleanup after a failed drive too.

## Helpers

The executable is `.cursor/skills/verify-mynameisjonas/verify-mynameisjonas.mjs`. Exit 0 prints a one-line status or a transfer list. Exit 1 prints the reason on stderr. A production host, a non-loopback URL, or a port other than this run's port is exit 1 before any request is sent.

| Command | Input | Output |
| --- | --- | --- |
| `launch` | optional `VERIFY_RUN_ID` | builds, migrates, serves; prints `run`, `base`, `evidence`, `VERIFY_RUN_ID` |
| `doctor` | the run id | `ok base=… pid=… marker=Jonas favicon=200` |
| `open <path>` | path or local URL | status, final URL, per-request bytes, navigation JSON path |
| `click <role> <name>` | exact accessible name | same shape as `open` for requests caused by the click |
| `fill <role> <name> <value>` | exact name; value is the last argument | `filled <role> "<name>"` |
| `expect-heading <name>` | exact heading name | `visible heading "…"` |
| `expect-role <role> <name>` | exact name; requires one match | `visible <role> "…"` |
| `expect-text <text>` | exact visible string | `visible text "…"` |
| `expect-path <pathname>` | final pathname, including a trailing slash | `path <pathname>` |
| `expect-request <method> <path> <status>` | looks at the previous `open` or `click` log | the matched line, or the log and exit 1 |
| `capture <id>` | id of lowercase letters, digits, hyphens | files under `evidence/<id>/` and the transfer list |
| `fetch <path> [--expect <status>]` | one response, redirects not followed | status, bytes, sha256, JSON path; exit 1 on `--expect` mismatch or a production `Location` |
| `lighthouse <path>` | local path | performance, LCP, CLS, total bytes; exit 1 if the report names a production host |
| `subscribers` | local D1 for this run | `subscribers=0`; exit 1 when any row is present |
| `cleanup` | the run id | pids stopped; prints the evidence directory |

`open` of a page that returns an HTTP error still exits 0 and prints the status. The following `expect-*` exits 1 when the user-visible result is missing. `fetch` records 404 for a file the build does not have.

## Maintenance

When a user-facing flow changes, update the matching file in `features/` in the same change. `/maintain-verification-skill` is the pass that checks this map against the running site.
