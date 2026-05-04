export const prerender = false;

import type { APIRoute } from 'astro';
import { env } from 'cloudflare:workers';
import { recordSubscription } from '../../lib/subscription';

export const POST: APIRoute = async ({ request }) => {
  const json = await request.json().catch(() => null) as { email?: unknown } | null;
  const result = await recordSubscription(env.DB, json?.email);

  if (!result.ok) {
    return Response.json({ error: 'Invalid email address' }, { status: 400 });
  }
  return Response.json({ success: true });
};
