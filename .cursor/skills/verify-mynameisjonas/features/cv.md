# CV

The CV page shows Jonas Eriksson's name, the role line, experience, and education.

## Sub-features

- `cv.heading` shows the heading "Jonas Eriksson" on `/cv/`.
- `cv.experience` shows the heading "experience".
- `cv.education` shows the heading "education".

## How to get to it (user POV)

- Activate the nav link "CV".
- Activate the hero link "> cv" on the home page.
- Open `/cv`.

## Driving it with Playwright

Preconditions: `doctor` exited 0 for this run.

- Open the CV.
  - Command: `./.cursor/skills/verify-mynameisjonas/verify-mynameisjonas.mjs open /cv`
  - Result: the final path is `/cv/` and the status is 200.
- Confirm the path.
  - Command: `./.cursor/skills/verify-mynameisjonas/verify-mynameisjonas.mjs expect-path /cv/`
  - Result: the path is `/cv/`.
- Read the name.
  - Command: `./.cursor/skills/verify-mynameisjonas/verify-mynameisjonas.mjs expect-heading "Jonas Eriksson"`
  - Result: the heading is visible. The prompt line "~ $ cat cv.md" in the snapshot distinguishes this page from the home heading.
- Read experience and education.
  - Command: `./.cursor/skills/verify-mynameisjonas/verify-mynameisjonas.mjs expect-heading experience`
  - Result: the heading "experience" is visible.
- Read education.
  - Command: `./.cursor/skills/verify-mynameisjonas/verify-mynameisjonas.mjs expect-heading education`
  - Result: the heading "education" is visible.
- Capture proof.
  - Command: `./.cursor/skills/verify-mynameisjonas/verify-mynameisjonas.mjs capture cv`
  - Result: `evidence/cv/` contains the screenshot, ARIA snapshot, and document status.

## Gotchas

- `/cv` returns 307 to `/cv/`. Assert `/cv/`.
- The contact line includes a link named "mynameisjonas.dev" whose target is the production site. Do not click it. The helper aborts that host.
- `/cv/print` is a separate print layout. This recipe does not open it.
- The home page uses the same heading text. Confirm the path before treating the heading as the CV.
