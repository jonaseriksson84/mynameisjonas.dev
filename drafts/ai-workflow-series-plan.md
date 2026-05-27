# AI workflow series — plan

## Format

Modeled loosely on the Gas City series in `src/content/blog/gas-city/`, but starting with a manifesto-style Part 0 and then walking through a real project end-to-end in subsequent parts.

## Publishing rhythm

- **Part 0** ships first — once we've shaped it from the fragments file.
- Parts 1+ follow over the next few days, each written *while doing* a fresh project so we have real prompts, outputs, screenshots, and logs to embed (the way the Gas City series was written).
- Part 0 should explicitly tell readers: a hands-on walkthrough is coming in the next few days. Set the expectation.

## Part 0 — the manifesto

Built from `drafts/ai-workflow-fragments.md`. Argues:

- The cadence shift (1/year → 4-6/month) and why it matters for a busy parent.
- The "thinking is still there, implementation not so much" thesis.
- A quick tour of the workflow's shape (`/grill-with-docs` → `/to-prd` → `/to-issues` → Sandcastle → design pass → ship).
- Honest caveats: vibe-coded slop, Mac issues, only used for personal projects so far.
- A list of recent projects this workflow produced.
- Closes with: "Next up, I'll do this live."

### The length worry

Part 0 risks being a very long read. Things to be ruthless about during `/writing-shape`:

- Cut any fragment that doesn't earn its place. Voice-y fragments are fine when they land; trim them when they sprawl.
- Resist the urge to fully explain each tool — Part 0 references them; the later parts demonstrate them.
- If Part 0 still runs long after shaping, consider splitting it: **0a — Why** (cadence, thesis, parent angle) and **0b — What this workflow looks like, at a high level**.

## Part 1+ — the live walkthrough

We build a fresh project from scratch, capturing the real artifacts as we go. Each part covers one stage of the workflow with a "By the end:" outcome list like the Gas City posts.

Tentative chapter breakdown:

1. Planning (`/grill-with-docs` + `/to-prd` + `/to-issues`)
2. Execution with Sandcastle
3. Design pass (Playwright CLI, HTML exploration trick)
4. Shipping (Cloudflare, deploy scripts, post-ship polish)

These may collapse or split once we start writing — the Gas City series merged/split chapters this way too.

## Project candidates

Two finalists, both ruled fit for tutorial use (external integration + small UI + opinionated output):

1. **"What should we do today?" — parent activity helper.** Inputs: weather, time of day, kid's energy. Output: an activity suggestion. Hits real life. Good design potential.
2. **"Is it bike-to-work weather?" — Stockholm hyperlocal widget.** Inputs: weather + air quality + sunrise/sunset + wind. Output: yes/no with reasoning. Opinionated, hyperlocal.

Pick one before starting Part 1.

## Open questions for tomorrow

- Run `/writing-shape` against the fragments file first, then re-assess Part 0's length.
- Decide which of the two project candidates to build.
- Decide whether Part 0 splits into 0a/0b, or stays as one piece.
