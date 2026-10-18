# Robots

`/robots.txt` allows crawlers and points at the sitemap.

## Sub-features

- `robots.status` returns 200 for `/robots.txt`.
- `robots.sitemap` names `https://mynameisjonas.dev/sitemap-index.xml`.

## How to get to it (user POV)

- Open `/robots.txt`.

## Driving it with Playwright

Preconditions: `doctor` exited 0 for this run.

- Read the file.
  - Command: `./.cursor/skills/verify-mynameisjonas/verify-mynameisjonas.mjs fetch /robots.txt --expect 200`
  - Result: status 200 and the body contains `Sitemap: https://mynameisjonas.dev/sitemap-index.xml`.

## Gotchas

- The sitemap URL is absolute and uses the site from config. A relative `Sitemap:` line is a failure.
