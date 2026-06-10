---
title: "I Build Software in My Sleep Now"
description: "I went from one personal project a year to several a month. Not because of the AI agents, exactly, but because of a specific workflow around them: plan it after the kids are asleep, and wake up to a working app."
date: 2026-06-11
tags: ["ai", "agents", "workflow", "claude-code"]
cover: /blog/ai-workflow-with-sandcastle/cover.png
draft: false
---

I used to build maybe one personal project a year, whenever the free time, the lust, and a good idea happened to overlap. In the last month I've shipped four to six. Not to make money. Just things I wanted to exist, that occurred to me and then did.

The easy way to tell this is "AI agents 10x'd my output." And it _is_ the agents, none of this would probably happen without them. But I'd had the agents for a while and was still building one thing a year *tops*. What changed is the workflow around them, a specific way of using them that finally clicked.

This is what I do now. Once the kids are down (I've got two young kids, and the workflow fits around them, not the other way around) I sit for an hour or two and plan the whole thing. I kick off the agents. I go to sleep. In the morning there's a largely working app waiting. Maybe it needs a few adjustments, but it's there. The evening I'd otherwise have spent just setting up a project, and probably getting nowhere on, is just done by the time I wake up.

## The Old Way

To see why that matters, look at how it used to go. An idea would arrive, I'd sit down excited, and the whole night would disappear into **scaffolding**: the boilerplate, the package installs, the wiring that comes before you've built anything real. Scaffolding is easy while the excitement lasts, but it eats so much time that you've barely started the actual project by the time the excitement runs out. Then a few days pass. You come back cold, half-remember what you were going to build, and the idea has faded. That's where my one-a-year projects went. Not abandoned on purpose, just **starved of momentum** before they were ever standing.

## Why Waking Up to It Works

Waking up to a usable app changes that completely. A **usable basis** is the part that matters most: once the thing exists and runs, you can build out the details you want, because you're reacting to something real instead of staring at an empty folder deciding whether it's even worth starting. The hardest part was never the details. It was crossing the gap from nothing to something, and that's the part I now sleep through.

There's a side effect I didn't expect. The agents need a plan to work from, so I have to actually write one, properly, before anything starts. That sounds like overhead, but it works the other way. The plan used to live in my head, and ideas in your head fade. Writing it down for the agent also writes it down for **future-me**. When I come back the next morning, the intent is still there on the page, exactly as sharp as the night before.

<p class="not-prose my-8 border-l-2 border-accent pl-5 text-xl font-medium leading-snug text-text-light dark:text-text-dark">Writing the plan for a machine solved a problem I'd always had with myself.</p>

## How the Workflow Works

So what does the workflow look like? At a high level it's a pipeline: turn a fuzzy idea into a real plan, turn the plan into a stack of independent tasks, then turn agents loose on the stack while I sleep. The first half happens while I'm still awake, as a chain of Claude Code skills that each feed the next.

### Plan It While You're Awake

It starts with a grilling session. I run [`/grill-with-docs`](https://www.aihero.dev/grill-with-docs) with a one-liner, say *"I want to build an internal betting league for the FIFA World Cup 2026"*, and it interviews me, relentlessly, until the idea in my head is pinned down: what it does, who it's for, the stack, where it deploys, and a long tail of edge-case questions I'd never have thought to answer on my own. It keeps going until it believes it's covered the bases, and I can push it further if I don't agree. Then [`/to-prd`](https://www.aihero.dev/skills-to-prd) takes that conversation and shapes it into a proper product requirements document, with user stories, functionality, and edge cases, which I file as a GitHub issue. Then [`/to-issues`](https://www.aihero.dev/skills-to-issues) breaks that document into a stack of small, free-standing tickets, the kind a single agent can pick up and finish without needing the rest of the project in its head.

### Let the Loop Run Overnight

Running those tickets is where the overnight part happens. The technique is something [Geoffrey Huntley](https://ghuntley.com/) named the [Ralph Wiggum loop](https://ghuntley.com/ralph/). Instead of one long agent session that slowly fills with context and loses the plot, you spin up a **fresh agent for every ticket**. Each session takes one issue, reads the repo, works out where the change fits, implements it, and stops. The next ticket gets a clean session of its own. Context never grows big enough for the agent to drift into the **dumb zone**, that place where it's carrying so much that it forgets what it's doing.

<figure class="not-prose my-8">
  <a href="https://www.youtube.com/watch?v=E5-QK3CDVQM" target="_blank" rel="noopener noreferrer" class="block">
    <img src="/blog/ai-workflow-with-sandcastle/sandcastle-run.png" alt="A Sandcastle agent log mid-run: a fresh agent reads GitHub issue #1, lists the workspace, works out that it needs a TypeScript script with Vitest, type checking, and a Commander CLI, then starts scaffolding." loading="lazy" class="w-full rounded-lg border border-stone-200 dark:border-stone-800 transition-opacity hover:opacity-90" />
  </a>
  <figcaption class="mt-2 text-sm text-text-muted-light dark:text-text-muted-dark">A Sandcastle run mid-flight: a fresh agent reading its issue and scaffolding from scratch. Screenshot from <a href="https://www.youtube.com/watch?v=E5-QK3CDVQM" target="_blank" rel="noopener noreferrer" class="text-accent underline hover:text-accent-hover transition-colors">Matt Pocock's video</a>.</figcaption>
</figure>

I don't run that loop by hand. I use [Sandcastle](https://github.com/mattpocock/sandcastle), [Matt Pocock](https://www.mattpocock.com/)'s implementation of the idea. You hand it your tickets as a **dependency graph** and it works the graph: a blocked task waits, agents pick up whatever's unblocked, and as tasks finish, more of them open up. I tried writing my own version first, a little thing called [ralph-cli](https://github.com/jonaseriksson84/ralph-cli), before realizing other people had already done it better. Sandcastle is the best one I've found.

Two things before I let it run. First, every ticket is labeled either **ready for agent** or **ready for human**. Some work has to be mine: API keys, deployment config, anything that needs a person in the loop. The trick I lean on is telling `/to-issues` to front-load all the human tasks, so I can clear those first and then let the agents run free. Second, I kick off Sandcastle and watch the first loop or two, just to confirm it's really picking up tickets, implementing them, and merging back to main. Once that looks healthy I go to bed and leave it running for as long as my usage holds out.

### The Morning After

In the morning I usually have a working app. Sometimes a few small things remain, startup bugs and the like, which I either fix by hand or hand off to a plain Claude Code session. They're usually easy. And to be honest, at this stage **the app looks like shit**. No effort has gone into design yet, and that's fine, because all I want first is to see the whole thing actually function. Sometimes seeing it work tells me there's more I want, maybe the first pass was a deliberate MVP, and then I start a new grilling session, make a new PRD, generate new issues, and set off another loop. If it's only minor fixes, I do those directly.

### Make It Stop Looking Like Shit

Once I'm happy with how the app works, I set up a design session. The functionality is solid, so now it's time for it to stop looking like shit. There are a few ways in: Anthropic's [Frontend Design skill](https://github.com/anthropics/skills/blob/main/skills/frontend-design/SKILL.md), Matt Pocock's [`/prototype`](https://www.aihero.dev/skills-prototype), Adam Wathan's [UI.sh](https://ui.sh), or just telling Claude Code what you want and iterating with it.

Two tricks make this stage work well. The first is asking the agent to build the design as one or more **standalone HTML pages with dummy data**, so you can judge the look without anything being wired up to real data yet. Some of the design skills do this by default. The second is the [Playwright CLI](https://playwright.dev/agent-cli/introduction), a newer, lighter library the Playwright team built specifically for agents rather than the heavier Playwright MCP. It lets the agent **open the page, look at it, and keep adjusting** until the result matches what you asked for. Point it at one of the HTML explorations, tell it to implement that version with a few tweaks, and it gets impressively close. Once a design lands, it goes back through the same loop: `/to-prd`, `/to-issues`, another Sandcastle run.

<figure class="not-prose my-8">
  <div class="grid gap-3 sm:grid-cols-2">
    <img src="/blog/ai-workflow-with-sandcastle/betto-before.png" alt="betto-balutto before the design pass: a plain black-on-white page with an HTML table of bets." loading="lazy" class="w-full rounded-lg border border-stone-200 dark:border-stone-800" />
    <img src="/blog/ai-workflow-with-sandcastle/betto-after.png" alt="betto-balutto after the design pass: a retro evening-newspaper layout with a bold masthead and editorial tables." loading="lazy" class="w-full rounded-lg border border-stone-200 dark:border-stone-800" />
  </div>
  <figcaption class="mt-2 text-sm text-text-muted-light dark:text-text-muted-dark">The same app, before and after a design pass. The "after" started life as a standalone HTML exploration the agent then implemented for real.</figcaption>
</figure>

### Ship It

At this point I usually ship. The project has been local the whole time, unless I asked the loop to deploy somewhere, which is rare, since I want to be sure of what I have first. Setting up deployment is a one-time job per project. I do it by hand or with Claude Code, and the important part is making sure deploy scripts exist afterward, so future changes push to the live app easily. The apps can live anywhere, but lately I've been very fond of Cloudflare. Almost everything I've shipped runs there, including this site. This isn't a Cloudflare ad, but their free tier is genuinely good, and a small fee buys a lot more room.

On the stack itself, Astro is my default. For heavily interactive apps there are better fits, and I've been trying Svelte for some of those. For the last bit of polish I skip the full Sandcastle loop and just chat with Claude Code to fix the small things, push it live, and sometimes share it around. A few days later I often think of more I want to do.

## The Thinking Is Still Mine

That's the whole shape: think up a project during the day, sit down for an hour or two after the kids are asleep and plan it, kick off the agents, come back to something usable in the morning. You can do it during the day too, and sometimes I do. The part I find exciting is being able to do it at all.

<p class="not-prose my-8 border-l-2 border-accent pl-5 text-xl font-medium leading-snug text-text-light dark:text-text-dark">The thinking is still there. The implementation part, not so much.</p>

## Honest Caveats

A few honest caveats. I've only used this for personal projects so far. It might carry over to professional work, but I haven't tested that, and some of what makes it easy here, like merging everything straight to main, wouldn't fly on a real team. Sandcastle has rough edges too. There are known issues on Mac, a few things you have to tell it almost every time, and now and then you nudge the prompt or switch it between sequential and parallel to get it unstuck. All of it is tracked in the repo.

And these apps are largely **vibe-coded slop**. I haven't read most of the source. I make sure there are tests, I can tell you how the pieces fit together and what each one does, but I don't have a deep feel for the code, and for these projects I don't need one. They're things I wanted to exist, and now they do. If you can even call that me building them. I don't know.

## What Came Out of It

Here's some of what came out of it, whatever the right verb is:

<div class="not-prose my-8 grid gap-3 sm:grid-cols-2">
  <div class="rounded-xl border border-stone-200 p-4 transition-colors hover:border-accent dark:border-stone-800">
    <div class="flex items-baseline justify-between gap-3">
      <a href="/" class="font-semibold text-text-light transition-colors hover:text-accent dark:text-text-dark">mynameisjonas.dev</a>
      <a href="https://github.com/jonaseriksson84/mynameisjonas.dev" target="_blank" rel="noopener noreferrer" class="shrink-0 text-xs text-text-muted-light transition-colors hover:text-accent dark:text-text-muted-dark">repo ↗</a>
    </div>
    <p class="mt-1.5 text-sm leading-snug text-text-muted-light dark:text-text-muted-dark">This blog.</p>
  </div>
  <div class="rounded-xl border border-stone-200 p-4 transition-colors hover:border-accent dark:border-stone-800">
    <div class="flex items-baseline justify-between gap-3">
      <a href="https://wc26.mynameisjonas.dev" target="_blank" rel="noopener noreferrer" class="font-semibold text-text-light transition-colors hover:text-accent dark:text-text-dark">fifa-wc-2026</a>
      <a href="https://github.com/jonaseriksson84/fifa-wc-2026" target="_blank" rel="noopener noreferrer" class="shrink-0 text-xs text-text-muted-light transition-colors hover:text-accent dark:text-text-muted-dark">repo ↗</a>
    </div>
    <p class="mt-1.5 text-sm leading-snug text-text-muted-light dark:text-text-muted-dark">An internal prediction pool for the FIFA World Cup 2026, for friends and colleagues.</p>
  </div>
  <div class="rounded-xl border border-stone-200 p-4 transition-colors hover:border-accent dark:border-stone-800">
    <div class="flex items-baseline justify-between gap-3">
      <a href="https://wc26-digest.mynameisjonas.dev" target="_blank" rel="noopener noreferrer" class="font-semibold text-text-light transition-colors hover:text-accent dark:text-text-dark">wc2026-digest</a>
      <a href="https://github.com/jonaseriksson84/wc2026-digest" target="_blank" rel="noopener noreferrer" class="shrink-0 text-xs text-text-muted-light transition-colors hover:text-accent dark:text-text-muted-dark">repo ↗</a>
    </div>
    <p class="mt-1.5 text-sm leading-snug text-text-muted-light dark:text-text-muted-dark">A daily page of what games are on and what to watch for. AI writes the blurbs; a web search pulls the headlines.</p>
  </div>
  <div class="rounded-xl border border-stone-200 p-4 transition-colors hover:border-accent dark:border-stone-800">
    <div class="flex items-baseline justify-between gap-3">
      <a href="https://gissapartiet.se" target="_blank" rel="noopener noreferrer" class="font-semibold text-text-light transition-colors hover:text-accent dark:text-text-dark">gissapartiet.se</a>
      <a href="https://github.com/jonaseriksson84/gissapartiet" target="_blank" rel="noopener noreferrer" class="shrink-0 text-xs text-text-muted-light transition-colors hover:text-accent dark:text-text-muted-dark">repo ↗</a>
    </div>
    <p class="mt-1.5 text-sm leading-snug text-text-muted-light dark:text-text-muted-dark">Guess which party each Swedish parliament member belongs to, from their photo. Messes with your preconceptions.</p>
  </div>
  <div class="rounded-xl border border-stone-200 p-4 transition-colors hover:border-accent dark:border-stone-800">
    <div class="flex items-baseline justify-between gap-3">
      <a href="https://github.com/jonaseriksson84/bq-notebook" target="_blank" rel="noopener noreferrer" class="font-semibold text-text-light transition-colors hover:text-accent dark:text-text-dark">bq-notebook</a>
      <span class="shrink-0 text-xs text-text-muted-light dark:text-text-muted-dark">repo only</span>
    </div>
    <p class="mt-1.5 text-sm leading-snug text-text-muted-light dark:text-text-muted-dark">A tiny catalogue for the BigQuery SQL I reuse, so I stop hunting my filesystem for half-remembered notes.</p>
  </div>
  <div class="rounded-xl border border-stone-200 p-4 transition-colors hover:border-accent dark:border-stone-800">
    <div class="flex items-baseline justify-between gap-3">
      <a href="https://chromacross.app" target="_blank" rel="noopener noreferrer" class="font-semibold text-text-light transition-colors hover:text-accent dark:text-text-dark">chromacross.app</a>
      <a href="https://github.com/jonaseriksson84/chromacross" target="_blank" rel="noopener noreferrer" class="shrink-0 text-xs text-text-muted-light transition-colors hover:text-accent dark:text-text-muted-dark">repo ↗</a>
    </div>
    <p class="mt-1.5 text-sm leading-snug text-text-muted-light dark:text-text-muted-dark">A small Wordle-alike. Kind of crappy, but a fun thing to have made.</p>
  </div>
</div>

A few of these are World Cup related, which is just because I'm excited about it right now. Being excited about something is what makes the ideas show up, and the workflow turns them into apps before the excitement fades.

Not everything makes it, even now. **[pulse](https://github.com/jonaseriksson84/pulse)** was an idea for a personal dashboard, with git, Slack, calendar, and AI activity at a glance, plus a summary I could share with my team. I left it unfinished. It needed access to so many things that I couldn't quite be bothered, and it's still sitting there. The workflow lowers the cost of starting a project. It doesn't make me finish the ones I lose interest in halfway through.

## What This Really Unlocks

<div class="not-prose my-8">
  <div class="rounded-xl border border-stone-200 p-5 transition-colors hover:border-accent dark:border-stone-800">
    <div class="flex items-baseline justify-between gap-3">
      <a href="https://betto-balutto.mynameisjonas.dev" target="_blank" rel="noopener noreferrer" class="text-lg font-semibold text-text-light transition-colors hover:text-accent dark:text-text-dark">betto-balutto</a>
      <a href="https://github.com/jonaseriksson84/betto-balutto" target="_blank" rel="noopener noreferrer" class="shrink-0 text-xs text-text-muted-light transition-colors hover:text-accent dark:text-text-muted-dark">repo ↗</a>
    </div>
    <p class="mt-1.5 text-sm leading-snug text-text-muted-light dark:text-text-muted-dark">Turns a weekly Swedish gambling podcast into tracked, auto-settling bets.</p>
  </div>
</div>

**betto-balutto** listens to a Swedish gambling podcast that drops an episode every week. When a new one lands, it pulls the audio, sends it to [Deepgram](https://deepgram.com) for Swedish transcription, uses the Anthropic API to work out what they were betting on and pull out the actual games and picks, hits a football odds API for the current odds on each pick, and then, once the games have been played, polls hourly and settles each bet to a win or a loss. It's a fun technical piece, and honestly the kind of thing I'd never have built before, or that would have taken me weeks. I did it in an evening or two.

## A Little Surreal, a Little Scary

Waking up to working software is a strange kind of thrill.

<p class="not-prose my-8 border-l-2 border-accent pl-5 text-xl font-medium leading-snug text-text-light dark:text-text-dark">You close the laptop on an idea and open it the next morning on a thing that runs.</p>

It's also a little surreal, and a little scary. Being a developer is my livelihood, and I can see where this is heading. I like where things are right now, where I'm still the one steering, still making the technical calls, still deciding how the pieces fit, and getting there without writing piles of boilerplate or fussing over package installs. The level I'm less sure about is the one after this one. Do we even need a human to steer? I don't have an answer. For now I'm glad to still be the one doing it.

## Next, I'll Do It Live

Before this, I tried [Gas City](https://github.com/gastownhall/gascity), another agent orchestration framework. It was exciting but big and complicated, and I wrote a [whole blog series about learning it](/blog/gas-city). I'm proud of that series, but I haven't gone back to Gas City, because this workflow has been so much better for me. They aim at different things, Gas City at big complicated work, this at small personal projects, and in a work setting maybe both have a place.

That series is also the model for what comes next. This piece has stayed at altitude on purpose, naming the tools without really showing them work. Over the next few days I'm going to build a fresh project from nothing using exactly this workflow, and write it up the same way, with the real prompts, outputs, screenshots, and logs. You've seen the shape. Next I'll show it actually running.
