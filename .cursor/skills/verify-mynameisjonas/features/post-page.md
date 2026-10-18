# Blog post

Gas City part 0 is the post "Part 0: Installation and setup". The page shows that heading, the cover image, a link to the next part, and a newsletter form that this recipe does not submit.

## Sub-features

- `post-page.heading` shows the heading "Part 0: Installation and setup".
- `post-page.cover` transfers `/blog/gas-city/cover-00.png` on a cold load of this document.
- `post-page.next` shows the link "next → Part 1: Starting the mayor and sending mail".
- `post-page.signup-present` shows the heading "Enjoying the series?" and the button "Subscribe".
- `post-page.transfers` records per-request transfer bytes for the document.

## How to get to it (user POV)

- From the blog index, activate "00 Installation and setup".
- Open `/blog/gas-city/00-setup` directly. The site redirects to the trailing slash.

## Driving it with Playwright

Preconditions: `doctor` exited 0 for this run. Gas City part 0 is in the build. This recipe uses the index link, not the direct URL.

- Open the blog index.
  - Command: `./.cursor/skills/verify-mynameisjonas/verify-mynameisjonas.mjs open /blog`
  - Result: the final path is `/blog/`, heading "Blog" will match, and the transfer list includes `/blog/gas-city/cover-00.png`.
- Confirm the index heading.
  - Command: `./.cursor/skills/verify-mynameisjonas/verify-mynameisjonas.mjs expect-heading Blog`
  - Result: the heading "Blog" is visible.
- Open part 0 from the series list.
  - Command: `./.cursor/skills/verify-mynameisjonas/verify-mynameisjonas.mjs click link "00 Installation and setup"`
  - Result: the final URL path is `/blog/gas-city/00-setup/` and the click's transfer list includes `/blog/gas-city/cover-00.png` with a content-length. The browser cache is disabled, so this repeats the image bytes.
- Confirm the path and title.
  - Command: `./.cursor/skills/verify-mynameisjonas/verify-mynameisjonas.mjs expect-path /blog/gas-city/00-setup/`
  - Result: the path is exactly that string.
- Read the title.
  - Command: `./.cursor/skills/verify-mynameisjonas/verify-mynameisjonas.mjs expect-heading "Part 0: Installation and setup"`
  - Result: the level-1 heading is visible.
- See the cover.
  - Command: `./.cursor/skills/verify-mynameisjonas/verify-mynameisjonas.mjs expect-role img "Part 0: Installation and setup"`
  - Result: one image with that name is visible.
- See the next part without leaving the page.
  - Command: `./.cursor/skills/verify-mynameisjonas/verify-mynameisjonas.mjs expect-role link "next → Part 1: Starting the mayor and sending mail"`
  - Result: that link is visible. Do not click it before capture.
- See the signup form and leave it alone.
  - Command: `./.cursor/skills/verify-mynameisjonas/verify-mynameisjonas.mjs expect-heading "Enjoying the series?"`
  - Result: the newsletter heading is visible.
- See the submit button.
  - Command: `./.cursor/skills/verify-mynameisjonas/verify-mynameisjonas.mjs expect-role button Subscribe`
  - Result: one "Subscribe" button is visible. Do not click it in this recipe.
- Capture proof.
  - Command: `./.cursor/skills/verify-mynameisjonas/verify-mynameisjonas.mjs capture post-page`
  - Result: `evidence/post-page/` contains the screenshot, ARIA snapshot, document status and headers, and the part-0 transfer list.

## Gotchas

- The part link's accessible name is "00 Installation and setup", not the full "Part 0:" title. The series nav on the post uses the full title.
- `/blog/gas-city/00-setup` returns 307 to `/blog/gas-city/00-setup/`. Assert the slashed path.
- Prose section headings include a `## ` prefix in the accessible name. The page title and "Enjoying the series?" do not.
- "Find me on X" leaves the site. Do not click it.
- The cover PNG is several megabytes. Record its content-length and transfer bytes. A large number is the baseline.
- This recipe does not submit the form. The newsletter feature is the one that does, and only against the local host.
- Opening the post URL directly is a separate entry point. Do not report it as verified by this click path.
