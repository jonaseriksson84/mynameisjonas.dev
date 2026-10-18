# Not found

An unknown path returns HTTP 404 and a failed shell session. The page says the path is missing and offers three commands, named home, blog, and cv.

## Sub-features

- `not-found.status` returns 404 for an unknown path.
- `not-found.heading` shows the heading "Page not found".
- `not-found.links` shows one link each named "home", "blog", and "cv".
- `not-found.echo` writes the requested path into the error line after the page opens.
- `not-found.navigate` follows the cv command to `/cv/`.

## How to get to it (user POV)

- Open a path that is not a page, such as `/no-such-page`.
- Open `/404` to see the same page with status 200.

## Driving it with Playwright

Preconditions: `doctor` exited 0 for this run.

- Request a missing path without following a redirect.
  - Command: `./.cursor/skills/verify-mynameisjonas/verify-mynameisjonas.mjs fetch /no-such-page --expect 404`
  - Result: status 404. The body contains `Page not found` and `this-page`. The body does not contain `/no-such-page`.
- Open the same path.
  - Command: `./.cursor/skills/verify-mynameisjonas/verify-mynameisjonas.mjs open /no-such-page`
  - Result: the document status is 404.
- Read the heading.
  - Command: `./.cursor/skills/verify-mynameisjonas/verify-mynameisjonas.mjs expect-heading "Page not found"`
  - Result: the heading "Page not found" is visible.
- Read the error line.
  - Command: `./.cursor/skills/verify-mynameisjonas/verify-mynameisjonas.mjs expect-text "cd: no such file or directory: /no-such-page"`
  - Result: that error line is visible.
- See the home link.
  - Command: `./.cursor/skills/verify-mynameisjonas/verify-mynameisjonas.mjs expect-role link home`
  - Result: one link named "home" is visible.
- See the blog link.
  - Command: `./.cursor/skills/verify-mynameisjonas/verify-mynameisjonas.mjs expect-role link blog`
  - Result: one link named "blog" is visible. The nav link is "Blog" and does not match.
- See the cv link.
  - Command: `./.cursor/skills/verify-mynameisjonas/verify-mynameisjonas.mjs expect-role link cv`
  - Result: one link named "cv" is visible. The nav link is "CV" and does not match.
- Capture proof while this page is still open.
  - Command: `./.cursor/skills/verify-mynameisjonas/verify-mynameisjonas.mjs capture not-found`
  - Result: `evidence/not-found/` contains the screenshot and the document status.
- Follow the cv command.
  - Command: `./.cursor/skills/verify-mynameisjonas/verify-mynameisjonas.mjs click link cv`
  - Result: the click leaves the not-found page.
  - Command: `./.cursor/skills/verify-mynameisjonas/verify-mynameisjonas.mjs expect-path /cv/`
  - Result: the path is `/cv/`.
- Request the prerendered file directly.
  - Command: `./.cursor/skills/verify-mynameisjonas/verify-mynameisjonas.mjs fetch /404 --expect 200`
  - Result: status 200.

## Gotchas

- `open` exits 0 when the document status is 404. The following `expect-*` checks the page. `fetch --expect 404` checks the status.
- The path appears twice after hydration, so a bare-path text check is the wrong proof. Use the full error line `cd: no such file or directory: /no-such-page`.
- `fetch` sees `this-page`, not the requested path.
- The nav links are "Blog" and "CV". The command links are "blog" and "cv". The names differ by case.
