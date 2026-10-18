# Home

The home page is a full-viewport portrait of Jonas Eriksson with his name, a one-line role, and links into the CV, projects, and blog.

## Sub-features

- `home.heading` shows the heading "Jonas Eriksson".
- `home.nav` shows the nav link "Blog" and the hero link "> blog".
- `home.portrait` loads the portrait as part of the page's transfer list. The canvas itself is hidden from assistive tech.

## How to get to it (user POV)

- Open the site root.
- Activate the nav brand link "mynameisjonas" from any other page.

## Driving it with Playwright

Preconditions: `doctor` exited 0 for this run.

- Open the root.
  - Command: `./.cursor/skills/verify-mynameisjonas/verify-mynameisjonas.mjs open /`
  - Result: the final path is `/`, the status is 200, and the transfer list includes the portrait image.
- Read the name.
  - Command: `./.cursor/skills/verify-mynameisjonas/verify-mynameisjonas.mjs expect-heading "Jonas Eriksson"`
  - Result: the heading is visible.
- See the blog entries.
  - Command: `./.cursor/skills/verify-mynameisjonas/verify-mynameisjonas.mjs expect-role link Blog`
  - Result: one nav link named "Blog" is visible.
- See the hero blog command.
  - Command: `./.cursor/skills/verify-mynameisjonas/verify-mynameisjonas.mjs expect-role link "> blog"`
  - Result: one link named "> blog" is visible.
- Capture proof.
  - Command: `./.cursor/skills/verify-mynameisjonas/verify-mynameisjonas.mjs capture home`
  - Result: `evidence/home/` contains the screenshot, ARIA snapshot, document status and headers, and transfer bytes.

## Gotchas

- The hero command links include a `> ` prefix in the accessible name. "blog" and "cv" do not match. Nav "Blog" does.
- Embark Studios, ARC Raiders, THE FINALS, and github on this page are off-site. Do not click them.
- The portrait canvas has no accessible name. Proof of the portrait is the image request in the transfer list, not a role query.
- This recipe drives the root URL. The brand link from another page is a separate entry point.
