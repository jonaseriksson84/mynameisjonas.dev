# Blog index

The blog index lists book reviews and the Gas City series, with each series part linked under the series title. The series banner is the part 0 cover image.

## Sub-features

- `blog-index.heading` shows the heading "Blog".
- `blog-index.series` shows the link "Building with Gas City" and the part link "00 Installation and setup".
- `blog-index.cover` transfers an optimized cover from `/_astro/` on a cold load. It does not transfer `/blog/gas-city/cover-00.png`.
- `blog-index.reviews` shows the book-review headings on the same page.

## How to get to it (user POV)

- Activate the nav link "Blog".
- Activate the hero link "> blog" on the home page.
- Activate "~/blog" on a post.

## Driving it with Playwright

Preconditions: `doctor` exited 0 for this run. The build contains the Gas City series and the two book reviews.

- Open the index the way the nav does.
  - Command: `./.cursor/skills/verify-mynameisjonas/verify-mynameisjonas.mjs open /blog`
  - Result: status ends at 200, the final path is `/blog/`, and the transfer list includes an image under `/_astro/` with a content-length. It does not include `/blog/gas-city/cover-00.png`.
- Read the title.
  - Command: `./.cursor/skills/verify-mynameisjonas/verify-mynameisjonas.mjs expect-heading Blog`
  - Result: the heading "Blog" is visible.
- See the series title.
  - Command: `./.cursor/skills/verify-mynameisjonas/verify-mynameisjonas.mjs expect-heading "Building with Gas City"`
  - Result: one heading with that name is visible.
- See part 0's row.
  - Command: `./.cursor/skills/verify-mynameisjonas/verify-mynameisjonas.mjs expect-role link "00 Installation and setup"`
  - Result: one link with that name is visible.
- See a review title.
  - Command: `./.cursor/skills/verify-mynameisjonas/verify-mynameisjonas.mjs expect-heading "Staff Engineer: Leadership Beyond the Management Track"`
  - Result: the review heading is visible.
- Capture proof.
  - Command: `./.cursor/skills/verify-mynameisjonas/verify-mynameisjonas.mjs capture blog-index`
  - Result: `evidence/blog-index/` contains the screenshot, ARIA snapshot, and the cold-load transfer list.

## Gotchas

- `/blog` returns 307 to `/blog/`. Assert the final path `/blog/`.
- The accessible name "Building with Gas City" is on two links (the banner and the title). `expect-role link` requires one match, so the series handle in this recipe is the heading plus the unique part link "00 Installation and setup".
- The series banner is a short greyscale crop of the part 0 cover, built under `/_astro/`. A multi-megabyte `cover-00.png` means the old public file is being served again.
- An empty index that says "No posts yet" means the build has no posts. Report that failure.
- This recipe opens `/blog` directly. The hero link "> blog" and the post breadcrumb "~/blog" are separate entry points.
