# My current AI workflow

I used to build maybe one personal project a year — whenever the free time, the lust, and a good idea happened to overlap. In the last month alone I've shipped four to six. Not things meant to make money. Just things I wanted to build, or that occurred to me and then existed.

---

I'm a busy father of two — a four-year-old and a four-month-old. The workflow has to fit around them, not the other way around.

---

The shape of an evening: plan the whole thing after the kids are down. Kick off the workflow. Go to sleep. Come back in the morning to a pretty much working app, maybe with some adjustments.

---

Usually it has worked out well enough that the app is usable by morning. And a usable basis is the thing — once it exists, you can actually build out the details you might want. Without it you're stuck deciding whether to start at all.

---

Before: I'd have an idea, get started, and spend the whole night setting up the scaffolding. Then maybe a couple of days would pass. I might come back to it. I might not.

Now: in the same evening I'd have spent on scaffolding, I can plan the whole project and set up agents to get started on it. They work through the night. When I get back to it, I have something usable.

---

Scaffolding is easy while you're still excited — but it eats so much time that you've barely started the actual project by the time the excitement runs out. Then a few days pass. You come back cold. You don't quite remember what you were going to do. The idea has faded.

---

A surprise side effect: the workflow has forced me to plan properly. The agents need a plan, so I have to write one. Before, the plan lived in my head — and ideas in your head fade. Externalizing it for the agent turns out to also externalize it for future-me.

---

To be clear: this isn't a story about AI agents 10x-ing my output. I've had access to the agents for a while. What 10x'd my output is this specific workflow — how I'm using them. The agents are necessary but not sufficient. The shape of the workflow is what changed everything.

---

Matt Pocock is the guy I first learned about through his TypeScript teachings — one of the authorities on TypeScript, with a stack of very good courses, free and paid.

---

The skill is the planning half. It helps you crystallize the idea you have in your head, reach a kind of shared understanding with the agent, and then turn that understanding into tasks the agents can actually consume and implement.

---

Sandcastle is Matt's version of a Ralph Wiggum loop — yes, the Simpsons character. The idea: tightly scoped tasks, arranged in a dependency graph, with agents kicked off to chew through them one after another. A task that's blocked by another won't start. Agents pick up whatever's free, and as previous tasks finish, more tasks unblock.

---

Mechanically, Sandcastle is a TypeScript CLI. Two modes:

1. **Sequential** — one agent picks up one task after another, all the way down.
2. **Parallel** — several agents pull from the queue at once, grabbing any unblocked task.

You decide which mode when you set Sandcastle up. It can change from project to project.

---

I usually start with a skill called `/grill-with-docs`. You kick it off with a one-liner — pick a real example: *"I want to build an internal betting league for the FIFA World Cup 2026."* Then it interviews you relentlessly.

---

The questions cover:

- What does this do?
- Who is it for?
- What tech stack?
- Where are we deploying?

And then a lot of in-depth questions about functionality — usually digging hard at edge cases.

---

The output is ADRs — Architectural Decision Records — that future sessions can pick up. By the end you have a pile of decided context the agents can lean on.

---

`/grill-with-docs` is specifically for engineering tasks, where ADRs make sense. There's also a plain `/grill-me` for anything else. If you want it to grill you on your wedding speech, that works too.

---

The good thing about the grilling skills: they just keep interviewing until they think they've covered all the bases. And if you don't think so, you can keep going.

---

Step two: `/to-prd`. It takes whatever's already in context — the grilling session output, usually — and shapes it into a Product Requirements Document. If you're starting fresh, you can dump the grilling notes into a markdown file and feed that in instead.

---

The PRD can be a markdown file, but my go-to is filing it as a GitHub issue. It comes out detailed: user stories, the functionality of the app, edge cases, the whole brief.

---

Step three: `/to-issues`. It breaks the PRD into a bunch of separate, free-standing, independent issues — the things you can hand off and let an agent chew through one by one.

---

The issues can be saved in whatever shape your tracker prefers: markdown files, Beads (Steve Yegge's task tracking system), Linear, Jira if your coding agent has access — Claude Code does. I use GitHub Issues.

---

A detail I should've mentioned earlier: I work in a plain git repo and push it to GitHub. GitHub Issues then becomes the task tracker for the project.

---

So at this point: I came in with a pretty loose idea, the grilling session crystallized it, `/to-prd` turned it into a Product Requirements Document, `/to-issues` broke that down into a stack of independent GitHub Issues. Now we're ready for implementation.

---

The Ralph Wiggum loop is a technique first coined by Geoffrey Huntley. The core move: spin up a fresh agent session for each task. Context never grows too big. The agent never drifts into the "dumb zone" — that place where its context is so bloated it loses the plot.

---

Each session takes one issue, reads the repo, figures out where the work fits, and implements it. Then it's done. Next task gets its own fresh session.

---

There are some surrounding documents — the ones `/grill-with-docs` creates — that hold the long-lived context about the project. They get updated as you work. If they fall out of date, you can put an agent on them to bring them back up to speed.

---

I actually started writing my own implementation of the Ralph Wiggum loop — `ralph-cli` on my GitHub. I quickly realized other people had done better implementations than I was going to. The best one I've found so far is Sandcastle.

---

Sandcastle isn't very complicated. There's a setup wizard that walks you through getting it configured for your project. Beyond that, the README on Matt's GitHub covers the rest.

---

Issues get labeled either **ready for agent** or **ready for human**. Some things have to be done by me — API keys, deployment configuration, anything that requires a human in the loop.

---

A trick: when running `/to-issues`, I tell the skill to front-load all the human-in-the-loop tasks. I clear those first. Then the agents can run free.

---

Then I kick off Sandcastle. It reads my GitHub repo, finds the issues marked **ready for agent**, and loops through them. It keeps going until either all of them are closed — or my Claude Code usage runs out. In that case I pick it up the next morning. Not the focus here, but worth being honest about.

---

For something small, the first pass usually produces something like 10 to 20 tickets.

---

Before walking away: I watch the first loop or two. Just to confirm Sandcastle is actually picking up tickets, implementing them, merging back to main, doing its thing. Once that looks healthy, I leave it running for as long as it can.

---

In the morning I usually have a working app. Sometimes a few small issues remain — startup bugs, that kind of thing. I either fix them manually or kick off a vanilla Claude Code session to handle it. Usually easily solvable.

---

To be honest, at this stage the app usually looks like shit. No effort has gone into design. That's fine — I just want to see the functionality in its entirety first.

---

Sometimes at this point I realize there's added functionality I want. Maybe the first pass was an intentional MVP, and now that it works I want more. Then I start a new grilling session, turn it into a new PRD, generate new issues, and set off another loop. If it's just minor fixes, I might do them directly with Claude Code or by hand.

---

Once I'm happy with how the app *works*, I set up a design session. The functionality is solid; now it's time for it to stop looking like shit.

---

A few ways to do the design pass:

- Anthropic's official **Frontend Design** skill.
- Matt Pocock has a `/prototype` skill that can do it.
- Adam Wathan (creator of Tailwind CSS) has UI.sh.
- Or just explain to Claude Code what you want and iterate.

---

A tip that's worked well for me: ask the agent to create one or more variations as a standalone HTML page with dummy data. That way you can evaluate the design without worrying about wiring up real data flow. Some of the design skills already do this by default.

---

Once a design lands, it's back through the same loop — `/to-prd`, `/to-issues`, another Sandcastle session.

---

The unlock at the design stage is the Playwright CLI — a newer, more lightweight library from the Playwright team, intended specifically for agents (not the heavier Playwright MCP). It lets the agent actually open the page, look at it, interact with it, and adjust until the result matches what you wanted. Point it at the HTML design exploration and tell it "implement this version, with these tweaks." I've been pretty impressed by how the agents implement a proposed design with this in the loop.

---

At this stage I usually ship it. The project has been local up to now — unless I specifically asked the loop to deploy somewhere, which is rare. I want to be sure of what I have before getting into deployment.

---

Setting up deployment is a one-time thing per project. I usually do it manually, or with Claude Code. The important bit is making sure deploy scripts exist after that — so future improvements push easily to the live app.

---

The apps can be hosted anywhere, but lately I've been very fond of Cloudflare. Just about everything I've shipped lives there, including this personal website.

This is not a Cloudflare ad — but their free tier is genuinely good, and for a very small fee you get a lot more capacity.

---

Tech-stack wise, Astro is my go-to. If the app is heavily interactive, there are better options — I've been experimenting with Svelte for some of these.

---

For final polish I don't usually run the full Sandcastle loop. I just chat with Claude Code to fix the small things, push it live, and sometimes share it with people. A few days later I often think of more I want to do.

---

The shape of the whole thing: think up a project during the day, sit down for an hour or two after the kids are in bed and plan it, kick off the agents, come back to something usable in the morning.

Of course you can do this during the day too — and sometimes I do. But the part that's actually exciting is being able to do it at all. **The thinking is still there. The implementation part — not so much.**

---

A caveat: I've only used this workflow for personal projects so far. It might apply to professional work too, but I haven't tested that.

---

These apps are largely vibe-coded slop. I haven't looked closely at a lot of the source. I make sure there are tests. I can tell you how the pieces fit together and what each one does. I don't have a deep sense of the code — but for these projects, I don't need to. They're things I wanted to exist, and now they do.

If you can even call that *me* building them. I don't know.

---

A few of the things I've built this way:

- **[mynameisjonas.dev](https://github.com/jonaseriksson84/mynameisjonas.dev)** — this blog.
- **[fifa-wc-2026](https://github.com/jonaseriksson84/fifa-wc-2026)** — internal prediction pool for the FIFA World Cup 2026, for friends and colleagues.
- **[wc2026-digest](https://github.com/jonaseriksson84/wc2026-digest)** — a daily page that tells me what games are on, what to watch for, surrounding stories. AI writes the blurbs, plus a web search pulls in headlines. We'll see if it actually makes sense once the tournament is on.
- **[gissapartiet.se](https://github.com/jonaseriksson84/gissapartiet)** — a guessing game with photos of Swedish parliament members (*ledamöter*) where you guess which party they belong to. Messes with your preconceptions in a fun way. Inspired by a UK version.
- **[bq-notebook](https://github.com/jonaseriksson84/bq-notebook)** — a tiny app for cataloguing and looking up the BigQuery SQL I reuse a lot, so I stop hunting through my filesystem for half-remembered notes. Intended for work.
- **[chromacross.app](https://github.com/jonaseriksson84/chromacross)** — a small Wordle-alike. Kind of crappy, but a fun thing to have made.

---

A few of these are FIFA World Cup-related — that's just because I'm excited about it. Being excited about something makes the ideas show up. The workflow turns them into apps before the excitement fades.

---

There's another one — **[betto-balutto](https://github.com/jonaseriksson84/betto-balutto)** — that I think shows what this workflow actually unlocks. It listens to a Swedish gambling podcast that drops a new episode each week. When a new one appears:

1. It pulls the audio.
2. Sends it to Deepgram for Swedish transcription.
3. Uses the Anthropic API to figure out what they were betting on — extracting the actual games and picks.
4. Hits a football/odds API to get the current odds for each pick.
5. After the games happen, it polls hourly and updates each bet to win or loss.

It's a fun technical piece. Honestly the kind of thing I would never have built before — or it would have taken me weeks. I did it in an evening or two with this workflow.

---

`pulse` is an idea I had for a personal dashboard — git, Slack, calendar, AI activity at a glance, plus a summary I could share with my team or boss. I left it unfinished. It needs access to so many things and I just couldn't quite be bothered. Might pick it up later.

---

Before this workflow I tried Gas City, another agent orchestration framework. Very exciting but big and complicated. I wrote a blog post series about it (the `rss-reader` repo is the project I built while learning Gas City).

I'm proud of the series. But I haven't actually gone back to Gas City — this workflow has been so much better *for me*. They're aimed at different things: Gas City for big, complicated work; this for simple personal projects. In a work setting? Not sure. Maybe both have a place.

---

Waking up to working software is genuinely exciting. The thing I would have spent that time setting up — and probably getting nowhere fast on — is just *done*.

---

It's also a little surreal. A little scary. Being a developer is my livelihood. I can see where this is going. I don't mind the current state — I actually like it. But the future? Do we even need a human to steer things?

---

I'm a developer at heart. I like making the technical decisions. I like talking about how things fit together. I enjoy not writing a pile of boilerplate, not worrying about package installations. The current level — where I'm still steering, still deciding — is a great place to be. I'm less sure about the level after that.

---

Failure modes with Sandcastle: there are a couple of caveats. Some things you have to tell it pretty much every time. There are known issues on Mac. All tracked in the repo. Sometimes you have to nudge the prompt, or tweak how it's running (sequential vs. parallel, merging strategy).

---

For personal projects, just merging everything to `main` works fine. In a work setting it wouldn't — you'd have to be very explicit about branching.

---

Setup tediousness: starting a new Sandcastle project means copying Claude API keys, setting up a GitHub personal access token, etc. I could automate this. I haven't. I probably will if the cadence keeps up.

---

Botched implementations have not really been a problem so far. The grilling sessions are thorough enough that the agent usually knows what I want. Sometimes the result doesn't quite match what I had in mind, or doesn't look right — but that's easily fixable.

---

When something does go wrong, I open a Claude Code session, point it at the Sandcastle repo, and tell it "this is erroring out because of X." It looks at the code, figures out what went wrong, and helps me restart.

---

A small workflow tip worth its own line: I usually have a Claude Code session *run* the Sandcastle commands for me. That way, when Sandcastle errors, Claude already has the context — no copy-pasting between terminals.

---

Sandcastle also produces logs. You can tell Claude to tail them, surface issues, and fix things as they come up. My experience overall: it's not doing stupid stuff without asking. It pauses, asks, fixes.

---

A side effect that wasn't really part of my workflow before: actually making a proper plan up front. Edge cases, the lot — which the grilling sessions and PRDs do for you. If I'd always done that, I'd probably have shipped more personal projects even without the agents.

---

On cost: you can run Sandcastle through a Claude Code subscription. That might be changing soon — I'm not sure how possible it'll be much longer.

---

I've been talking about Claude Code a lot. Worth highlighting: Sandcastle doesn't have to use it. In theory it's compatible with Codex, Cursor's agents, others. But it's not really set up for those — you'd have to do a lot of plumbing yourself. There are open issues in the Sandcastle tracker about this.
