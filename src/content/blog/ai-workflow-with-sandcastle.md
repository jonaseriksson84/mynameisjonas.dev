---
title: "I Build Software in My Sleep Now"
description: "I went from one personal project a year to several a month, not because the agents 10x'd me, but because the work finally fits in an evening: plan after the kids are down, kick it off, and wake up to something that runs."
date: 2026-06-11
tags: ["ai", "agents", "workflow", "claude-code"]
cover: /blog/ai-workflow-with-sandcastle/cover.png
draft: true
---

I used to build maybe one personal project a year, whenever the free time, the lust, and a good idea happened to overlap. In the last month I've shipped four to six. Not to make money. Just things I wanted to exist, that occurred to me and then did.

The easy way to tell this is that AI agents 10x'd my output, and it *is* the agents, none of this would happen without them. But I'd had the agents for a while and was still building one thing a year, tops. What changed is the shape of the evening.

I'm a father of two, and the work has to fit around them, not the other way around. After the kids are down I sit for an hour or two, plan the whole thing, kick off the agents, and go to sleep. In the morning there's a largely working app waiting. Maybe it needs a few adjustments, but it's there. The evening I'd otherwise have spent scaffolding, and probably getting nowhere, is just done.

## An evening: betto-balutto

Take a Tuesday. I've been listening to a Swedish gambling podcast that drops every week, and I want something that hears a new episode, pulls out the bets, and settles them when the games finish. A year ago that would have been a weekend I didn't have. Tonight it's a one-liner I type into [`/grill-with-docs`](https://www.aihero.dev/grill-with-docs): *I want an app that listens to this podcast and tracks their bets.*

It interviews me until the idea is actually pinned down: what it does, who it's for, the stack, where it deploys, and a long tail of edge cases I would never have written down on my own. [`/to-prd`](https://www.aihero.dev/skills-to-prd) turns that conversation into a brief, and [`/to-issues`](https://www.aihero.dev/skills-to-issues) cuts the brief into GitHub tickets that a single agent can finish without holding the whole project in its head.

Some tickets have to be mine (API keys, deploy, anything that needs a person) so they're labeled **ready for human**. I tell the skill to put those first, knock them out, and leave the rest marked **ready for agent**. Then I start [Sandcastle](https://github.com/mattpocock/sandcastle), [Matt Pocock](https://www.mattpocock.com/)'s version of a [Ralph Wiggum loop](https://ghuntley.com/ralph/): a fresh agent per ticket, on a dependency graph, so context never gets fat enough to go dumb. I watch the first loop pick up a ticket, change the repo, and merge to main, just to confirm it's actually doing the thing. Then I close the laptop.

## The morning after

In the morning there is an app. It pulls the audio, sends it to Deepgram for Swedish, uses Anthropic to extract the games and the picks, hits an odds API, and after kickoff it polls until the bets come back win or loss.

I didn't write that, and I also didn't spend the night on `package.json`. The evening I would have burned on scaffolding is just done.

<p class="not-prose my-8 border-l-2 border-accent pl-5 text-xl font-medium leading-snug text-text-light dark:text-text-dark">Writing the plan for a machine solved a problem I'd always had with myself.</p>

The agents need a plan on disk, so I have to make one. The plan used to live in my head, and ideas in your head fade. Externalizing it for the agent also externalizes it for morning-me. I come back and the intent is still as sharp as it was the night before.

That's [betto-balutto](https://betto-balutto.mynameisjonas.dev). It's the kind of thing I would never have built before, or that would have taken me weeks. It took an evening and a night.

It did work, in theory. In practice it needed a lot of manual correction, especially the Swedish transcription, and in the end I turned the automatic updates off. It's frozen in time now. Waking up to a working app is not the same as having something you can leave running.

To be honest, at this stage the app looks like shit. No effort has gone into design yet, and that's fine, because all I want first is to see the whole thing actually function. Then I do a design pass: standalone HTML with dummy data so I can judge the look without wiring anything up, and the [Playwright CLI](https://playwright.dev/agent-cli/introduction) so the agent can open the page, look at it, and keep adjusting. Once a direction lands, it goes back through the same loop. Tickets, fresh agents, merge.

<figure class="not-prose my-8">
  <div class="grid gap-3 sm:grid-cols-2">
    <img src="/blog/ai-workflow-with-sandcastle/betto-before.png" alt="betto-balutto before the design pass: a plain black-on-white page with an HTML table of bets." loading="lazy" class="w-full rounded-lg border border-stone-200 dark:border-stone-800" />
    <img src="/blog/ai-workflow-with-sandcastle/betto-after.png" alt="betto-balutto after the design pass: a retro evening-newspaper layout with a bold masthead and editorial tables." loading="lazy" class="w-full rounded-lg border border-stone-200 dark:border-stone-800" />
  </div>
  <figcaption class="mt-2 text-sm text-text-muted-light dark:text-text-muted-dark">The same app, before and after a design pass. The "after" started as a standalone HTML exploration the agent then implemented for real.</figcaption>
</figure>

Then I ship. Almost everything of mine lives on Cloudflare, including this site. The important part is that deploy scripts exist afterwards, so the next change is a push rather than a ceremony.

## The thinking is still mine

<p class="not-prose my-8 border-l-2 border-accent pl-5 text-xl font-medium leading-snug text-text-light dark:text-text-dark">The thinking is still there. The implementation part, not so much.</p>

I still decide what the thing is, how the pieces fit, and what done means. I don't write the boilerplate and I don't babysit package installs, and that's the level I actually like. The one after that, where maybe nobody needs to steer, I don't have an answer for. I'm a developer, this is my livelihood, and I can see the shape of it.

A few honest caveats, because they belong next to the thrill rather than in a pile at the end.

These apps are largely vibe-coded slop. I haven't read most of the source. I make sure there are tests, and I can tell you how the pieces fit together, but I don't have a deep feel for the code, and for these projects I don't need one. They're things I wanted to exist, and now they do. If you can even call that me building them, I don't know.

I've only used this on personal work. Merging everything straight to `main` is fine here and would not be fine on a team. Sandcastle has known Mac issues and a few things you have to tell it every time. I tried writing my own loop first ([ralph-cli](https://github.com/jonaseriksson84/ralph-cli)) and stopped when I found a better one.

It also doesn't make me finish the ones I lose interest in. [pulse](https://github.com/jonaseriksson84/pulse) was going to be git, Slack, calendar, and AI activity in one dashboard, plus a summary I could share with the team. It needed access to so many things that I couldn't quite be bothered, and it's still sitting there. The workflow lowers the cost of starting. It doesn't make me finish.

The others that came out of the same kind of evening: this site, a [World Cup prediction pool](https://wc26.mynameisjonas.dev), a [daily WC digest](https://wc26-digest.mynameisjonas.dev), [gissapartiet.se](https://gissapartiet.se), a [BigQuery notebook](https://github.com/jonaseriksson84/bq-notebook), a [crappy Wordle](https://chromacross.app). A few of those are World Cup related just because I'm excited about it right now. Being excited is what makes the ideas show up. The workflow turns them into apps before the excitement fades.

I wrote a whole series on [Gas City](/blog/gas-city) before this, and I'm proud of it, but I haven't gone back. That tool is for big, messy work. This is for small things I want to exist by morning.

You close the laptop on an idea and open it the next morning on a thing that runs. That's the whole trick, and it's a little surreal, and a little scary, and I like where I am with it right now.
