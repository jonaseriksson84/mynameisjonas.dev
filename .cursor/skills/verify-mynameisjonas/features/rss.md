# RSS

`/rss.xml` lists every published post, with the post title, date, and description, and an absolute link on `mynameisjonas.dev`. Drafts are absent.

## Sub-features

- `rss.status` returns 200 for `/rss.xml`.
- `rss.items` has one item per published post.
- `rss.links` uses absolute `https://mynameisjonas.dev/blog/...` links.
- `rss.drafts` does not include a draft title.

## How to get to it (user POV)

- Open `/rss.xml`.
- Follow the RSS alternate link in the page head.

## Driving it with Playwright

Preconditions: `doctor` exited 0 for this run. The build contains the published posts and no draft fixture.

- Read the feed.
  - Command: `./.cursor/skills/verify-mynameisjonas/verify-mynameisjonas.mjs fetch /rss.xml --expect 200`
  - Result: status 200, the body is XML, the item count equals the published posts, each item link starts with `https://mynameisjonas.dev/blog/`, and the body does not contain `Hidden draft`.

## Gotchas

- `fetch` does not follow redirects and does not render XML. Count `<item>` in the saved body.
- The feed lists posts, including series parts and book reviews. It does not list the Gas City overview page.
- Item order is newest first.
