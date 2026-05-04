# D1 for subscriber storage

We use Cloudflare D1 (SQLite) to store newsletter subscribers rather than Cloudflare KV. KV is simpler for single-key lookups but awkward for listing and querying — you'd have to iterate keys to export the subscriber list. D1 gives us a proper `subscribers` table with a UNIQUE constraint on email (for deduplication) and timestamps, and makes it trivial to export a CSV when we're ready to plug in an email service.
