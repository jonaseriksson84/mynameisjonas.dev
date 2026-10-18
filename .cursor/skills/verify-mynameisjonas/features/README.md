# mynameisjonas.dev verification map

This directory is the maintained source for verifying the user-facing behavior of mynameisjonas.dev. Read the index before driving the site, then use the matching feature file as the recipe.

## Baseline preconditions

- Launch the built site with `.cursor/skills/verify-mynameisjonas/verify-mynameisjonas.mjs launch`.
- The base URL is `http://127.0.0.1:<port>` printed by launch. The port changes per run.
- Set `VERIFY_RUN_ID` when another verification run is already using `latest`.
- The local D1 has the `subscribers` table and zero rows. Blog posts, the CV, and the home page come from the build.
- Chromium is installed (`pnpm exec playwright install chromium`).
- Run `doctor` and require exit 0 before driving.
- Never drive an instance that was not started by this verification run.
- Never send a request to `mynameisjonas.dev` or `www.mynameisjonas.dev`.

## Driving conventions

- Start every recipe from the baseline state unless its preconditions say otherwise.
- Run commands from the repo root. Treat every command as literal.
- Prefer ARIA roles and exact accessible names.
- The verification browser does not use the HTTP cache. Transfer bytes are a cold load.
- `open` follows a same-origin trailing-slash redirect and records both hops.
- Do not click an off-site link. Do not submit the newsletter except in the newsletter recipe, and only to the local base URL, with `verify-local@example.com`.
- Restore nothing: the recipe does not insert a subscriber. Do not remove proof artifacts during cleanup.

## Proof and skip reporting

- Capture the user action and the resulting state, not only the final screen.
- UI proof is an ARIA snapshot and a screenshot from `capture`.
- Transfer proof is the per-request list from `open` or `click`, including `content-length` on the cover image.
- Newsletter proof is the 403 response and `subscribers=0`.
- Record the feature id and the entry point with every `capture`.
- Report an unreachable path with the command that failed and the unmet precondition.
- Do not report a skipped entry point as verified through a different path.

## Feature entry contract

Each feature file starts with an H1 title and one paragraph describing the user-visible behavior. It then uses exactly four H2 sections in this order.

1. `Sub-features` lists short IDs with one line for each behavior.
2. `How to get to it (user POV)` lists every user entry point.
3. `Driving it with Playwright` starts with `Preconditions:` and uses labeled bullets that pair each user action with an exact command and observable result.
4. `Gotchas` lists traps that can waste or invalidate a verification run.

Keep implementation details out of the map. Name only user paths, stable handles, required state, commands, and observable proof.

## Features

- [Home](./home.md) covers the portrait hero, the name heading, and the nav.
- [Blog index](./blog-index.md) covers the post list, the Gas City series, and the cover image weight.
- [Blog post](./post-page.md) covers Gas City part 0, its cover, the next part, and the signup form left unsent.
- [CV](./cv.md) covers the CV heading and experience section.
- [Newsletter signup](./newsletter.md) covers the local failure shape and the empty subscribers table.
