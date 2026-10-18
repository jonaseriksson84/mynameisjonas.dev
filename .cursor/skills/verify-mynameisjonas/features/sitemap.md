# Sitemap

`/sitemap-index.xml` points at the page sitemap. The listed pages omit `/cv/print` and `/api/*`.

## Sub-features

- `sitemap.index` returns 200 for `/sitemap-index.xml`.
- `sitemap.pages` lists public pages and omits `/cv/print` and `/api/`.

## How to get to it (user POV)

- Open `/sitemap-index.xml`.
- Follow the sitemap URL in `/robots.txt`.

## Driving it with Playwright

Preconditions: `doctor` exited 0 for this run.

- Read the index.
  - Command: `./.cursor/skills/verify-mynameisjonas/verify-mynameisjonas.mjs fetch /sitemap-index.xml --expect 200`
  - Result: status 200 and the body names a child sitemap on this host.
- Read the child sitemap named by that index.
  - Command: `./.cursor/skills/verify-mynameisjonas/verify-mynameisjonas.mjs fetch /sitemap-0.xml --expect 200`
  - Result: status 200, the body contains `https://mynameisjonas.dev/blog/`, and it contains neither `/cv/print` nor `/api/`.

## Gotchas

- The child file name comes from the index. If it is not `/sitemap-0.xml`, fetch the path the index names.
- `/cv/print` still responds in the browser. It is omitted from the sitemap because that page is `noindex`.
