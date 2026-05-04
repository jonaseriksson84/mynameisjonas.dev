# mynameisjonas.dev

A personal website and blog by Jonas Eriksson, built with Astro and deployed on Cloudflare Workers.

## Language

**Subscriber**:
A person who has submitted their email address via the newsletter signup form.
_Avoid_: User, member, contact

**Subscription**:
The act of a Subscriber submitting their email — represented as a row in the D1 `subscribers` table with a `subscribed_at` timestamp.
_Avoid_: Sign-up record, registration

**Unsubscribed**:
A Subscriber whose `unsubscribed_at` timestamp is set, indicating they should not be emailed.
_Avoid_: Deleted, removed, opted-out

**Series**:
A linked sequence of blog posts that share the same `series` name and are ordered by their `part` number. Has its own overview page at `/blog/<series-name>`. The directory containing the parts and the `series` field share the same slug.
_Avoid_: Collection, group, set

**Series part**:
An individual post within a Series, identified by its `part` number. Required: `series`, `part`. Optional: `seriesTitle`, `seriesDescription` (typically only on part 0).
_Avoid_: Chapter, episode

## Relationships

- A **Subscriber** has exactly one email address
- A **Subscriber** is either active (no `unsubscribed_at`) or **Unsubscribed**
- A **Series** is composed of one or more **Series parts**
- A **Series part** belongs to exactly one **Series**

## Example dialogue

> **Dev:** "Should we delete the row when someone unsubscribes?"
> **Domain expert:** "No — set `unsubscribed_at`. We keep the record but exclude them from sends."
