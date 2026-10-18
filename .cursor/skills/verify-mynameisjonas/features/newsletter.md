# Newsletter signup

A Gas City post offers a newsletter form. On this local site the submit fails visibly, the request is rejected, and the subscribers table stays empty.

## Sub-features

- `newsletter.form` shows the heading "Enjoying the series?", the email field "your@email.com", and the button "Subscribe".
- `newsletter.preview-rejected` shows "Something went wrong. Please try again." after submit, and the request log contains `POST /api/subscribe` with status 403.
- `newsletter.no-row` leaves the local subscribers table empty.

## How to get to it (user POV)

- Open any Gas City part and find the form under the article. This recipe uses part 0.

## Driving it with Playwright

Preconditions: `doctor` exited 0 for this run. `subscribers` reports `subscribers=0` before the submit. The base URL host is `127.0.0.1`.

- Confirm the table is empty.
  - Command: `./.cursor/skills/verify-mynameisjonas/verify-mynameisjonas.mjs subscribers`
  - Result: `subscribers=0`.
- Open part 0.
  - Command: `./.cursor/skills/verify-mynameisjonas/verify-mynameisjonas.mjs open /blog/gas-city/00-setup`
  - Result: the final path is `/blog/gas-city/00-setup/`.
- See the form.
  - Command: `./.cursor/skills/verify-mynameisjonas/verify-mynameisjonas.mjs expect-heading "Enjoying the series?"`
  - Result: the heading is visible.
- Enter the reserved test address.
  - Command: `./.cursor/skills/verify-mynameisjonas/verify-mynameisjonas.mjs fill textbox your@email.com verify-local@example.com`
  - Result: the field named "your@email.com" is filled. The address is `verify-local@example.com`.
- Submit.
  - Command: `./.cursor/skills/verify-mynameisjonas/verify-mynameisjonas.mjs click button Subscribe`
  - Result: the page stays on the post. The request log shows `POST /api/subscribe`.
- Read the visible failure.
  - Command: `./.cursor/skills/verify-mynameisjonas/verify-mynameisjonas.mjs expect-text "Something went wrong. Please try again."`
  - Result: that string is visible.
- Require the 403.
  - Command: `./.cursor/skills/verify-mynameisjonas/verify-mynameisjonas.mjs expect-request POST /api/subscribe 403`
  - Result: the previous request log contains that status. A 200 is a failed run.
- Confirm the table is still empty.
  - Command: `./.cursor/skills/verify-mynameisjonas/verify-mynameisjonas.mjs subscribers`
  - Result: `subscribers=0`.
- Capture proof.
  - Command: `./.cursor/skills/verify-mynameisjonas/verify-mynameisjonas.mjs capture newsletter`
  - Result: `evidence/newsletter/` shows the error state. `evidence/subscribers.json` lists zero rows.

## Gotchas

- The email field's accessible name is the placeholder "your@email.com". Another textbox on the page is "Custom accent". `fill` must use the placeholder name.
- The UI does not show the response body. The 403 text "Signup is disabled on preview" is in the request, not in the page copy.
- Do not point this form at `mynameisjonas.dev`. Do not change the Host header. A 200 means the run hit a host that accepts signups.
- Use only `verify-local@example.com`.
- Direct URL entry is the path this recipe drives. Reaching the form by clicking through the index is a separate entry point.
