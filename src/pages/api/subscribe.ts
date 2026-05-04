export const prerender = false;

import type { APIRoute } from 'astro';
import { env } from 'cloudflare:workers';

export const POST: APIRoute = async ({ request }) => {
  const json = await request.json().catch(() => null) as Record<string, unknown> | null;
  const email = typeof json?.email === 'string' ? json.email.trim().toLowerCase() : '';

  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return new Response(JSON.stringify({ error: 'Invalid email address' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const db = env.DB;

  await db
    .prepare('INSERT INTO subscribers (email, subscribed_at) VALUES (?, ?) ON CONFLICT (email) DO NOTHING')
    .bind(email, new Date().toISOString())
    .run();

  return new Response(JSON.stringify({ success: true }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  });
};
