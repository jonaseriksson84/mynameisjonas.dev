# Not found

An unknown path returns HTTP 404 and a page whose only copy is "Page not found" plus links home and to the blog.

## Sub-features

- `not-found.status` returns 404 for an unknown path.
- `not-found.heading` shows the heading "Page not found".
- `not-found.links` shows the links "home" and "blog".

## How to get to it (user POV)

- Open a path that is not a page, such as `/no-such-page`.

## Driving it with Playwright

Preconditions: `doctor` exited 0 for this run.

- Request a missing path without following a redirect.
  - Command: `./.cursor/skills/verify-mynameisjonas/verify-mynameisjonas.mjs fetch /no-such-page --expect 404`
  - Result: status 404 and the body contains `Page not found`.
- Open the same path.
  - Command: `./.cursor/skills/verify-mynameisjonas/verify-mynameisjonas.mjs open /no-such-page`
  - Result: the document status is 404.
- Read the heading.
  - Command: `./.cursor/skills/verify-mynameisjonas/verify-mynameisjonas.mjs expect-heading "Page not found"`
  - Result: the heading "Page not found" is visible.
- See the home link.
  - Command: `./.cursor/skills/verify-mynameisjonas/verify-mynameisjonas.mjs expect-role link home`
  - Result: one link named "home" is visible.
- See the blog link.
  - Command: `./.cursor/skills/verify-mynameisjonas/verify-mynameisjonas.mjs expect-role link blog`
  - Result: one link named "blog" is visible. The nav link is "Blog" and does not match.
- Capture proof.
  - Command: `./.cursor/skills/verify-mynameisjonas/verify-mynameisjonas.mjs capture not-found`
  - Result: `evidence/not-found/` contains the screenshot and the document status.

## Gotchas

- `open` exits 0 when the document status is 404. The following `expect-*` checks the page. `fetch --expect 404` checks the status.
- Do not use the nav "Blog" link as the proof of the page's blog link.
