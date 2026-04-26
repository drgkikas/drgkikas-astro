// src/pages/api/submit.ts
import type { APIRoute } from 'astro';
import { calculateScore } from '../../lib/scoring';
import { buildEmail } from '../../lib/emails';

export const prerender = false;

const ALLOWED_ORIGINS = ['https://drgkikas.com', 'https://www.drgkikas.com'];

export const OPTIONS: APIRoute = async ({ request }) => {
  const origin = request.headers.get('Origin') ?? '';
  const allowed = ALLOWED_ORIGINS.includes(origin) ? origin : ALLOWED_ORIGINS[0];
  return new Response(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': allowed,
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    }
  });
};

export const POST: APIRoute = async ({ request, locals }) => {
  const origin = request.headers.get('Origin') ?? '';
  const allowed = ALLOWED_ORIGINS.includes(origin) ? origin : ALLOWED_ORIGINS[0];
  const corsHeaders = {
    'Access-Control-Allow-Origin': allowed,
    'Content-Type': 'application/json'
  };

  try {
    const body = await request.json();
    const { test_name, email, answers, turnstile_token } = body;

    // Get Keys
    const env = (locals as any).runtime?.env || (process as any).env || {};
    const resendKey = env.RESEND_API_KEY;
    const turnstileSecret = env.TURNSTILE_SECRET_KEY || '1x0000000000000000000000000000000AA';
    const db = env.DB;

    // 1. Calculate Result Immediately
    const result = calculateScore(test_name, answers);

    // 2. Verification (Optional Fallback)
    if (turnstile_token && turnstile_token !== 'fallback-token') {
      const v = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ secret: turnstileSecret, response: turnstile_token })
      });
      const vData = await v.json() as any;
      if (!vData.success) {
        console.error('Turnstile Fail:', vData['error-codes']);
      }
    }

    // 3. Send Email (Main Goal)
    let emailSent = false;
    if (resendKey) {
      try {
        const mail = buildEmail(test_name, email, result.score_json as any);
        const res = await fetch('https://api.resend.com/emails', {
          method: 'POST',
          headers: { 'Authorization': `Bearer ${resendKey}`, 'Content-Type': 'application/json' },
          body: JSON.stringify({
            from: 'drGkikas <noreply@drgkikas.com>',
            to: mail.to,
            subject: mail.subject,
            html: mail.html,
          })
        });
        emailSent = res.ok;
      } catch (e) { console.error('Email error:', e); }
    }

    // 4. Save to DB (Silent)
    if (db) {
      try {
        await db.prepare('INSERT INTO submissions (test_name, email, score_json, level, raw_answers, email_sent) VALUES (?, ?, ?, ?, ?, ?)')
          .bind(test_name, email, JSON.stringify(result.score_json), result.level, JSON.stringify(answers), emailSent ? 1 : 0)
          .run();
      } catch (dbE) { console.error('DB error:', dbE); }
    }

    return new Response(JSON.stringify({ success: true, result, email_sent: emailSent }), {
      status: 200,
      headers: corsHeaders
    });

  } catch (err: any) {
    console.error('API Error:', err);
    return new Response(JSON.stringify({ error: err.message || 'Internal Server Error' }), {
      status: 500,
      headers: corsHeaders
    });
  }
};
