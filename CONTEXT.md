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

## Relationships

- A **Subscriber** has exactly one email address
- A **Subscriber** is either active (no `unsubscribed_at`) or **Unsubscribed**

## Example dialogue

> **Dev:** "Should we delete the row when someone unsubscribes?"
> **Domain expert:** "No — set `unsubscribed_at`. We keep the record but exclude them from sends."
