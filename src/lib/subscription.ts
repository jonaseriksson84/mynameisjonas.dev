import type { D1Database } from '@cloudflare/workers-types';
import { z } from 'astro/zod';

const emailSchema = z.string().trim().toLowerCase().email();

export type SubscribeResult =
  | { ok: true }
  | { ok: false; error: 'invalid_email' };

export async function recordSubscription(db: D1Database, rawEmail: unknown): Promise<SubscribeResult> {
  const parsed = emailSchema.safeParse(rawEmail);
  if (!parsed.success) {
    return { ok: false, error: 'invalid_email' };
  }
  await db
    .prepare('INSERT INTO subscribers (email, subscribed_at) VALUES (?, ?) ON CONFLICT (email) DO NOTHING')
    .bind(parsed.data, new Date().toISOString())
    .run();
  return { ok: true };
}
