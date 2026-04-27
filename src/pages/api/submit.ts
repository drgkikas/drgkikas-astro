// src/pages/api/submit.ts
import type { APIRoute } from 'astro';
import { calculateScore } from '../../lib/scoring';
import { buildEmail } from '../../lib/emails';

export const prerender = false;

const ALLOWED_ORIGINS = ['https://drgkikas.com', 'https://www.drgkikas.com'];

function getCorsHeaders(request: Request) {
  const origin = request.headers.get('Origin') ?? '';
  const allowed = ALLOWED_ORIGINS.includes(origin) ? origin : ALLOWED_ORIGINS[0];
  return {
    'Access-Control-Allow-Origin': allowed,
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Vary': 'Origin'
  };
}

export const OPTIONS: APIRoute = async ({ request }) => {
  return new Response(null, {
    status: 204,
    headers: getCorsHeaders(request)
  });
};

export const POST: APIRoute = async ({ request }) => {
  const corsHeaders = getCorsHeaders(request);

  try {
    const body = await request.json();
    const { test_name, email, answers } = body;

    // 1. Get Keys (Robust Method)
    let resendKey: string | undefined;
    let db: D1Database | undefined;
    
    try {
      const cf = await import('cloudflare:workers' as any);
      resendKey = cf.env?.RESEND_API_KEY;
      db = cf.env?.DB;
    } catch (e) {
      // Fallback for local dev
      resendKey = (process as any).env?.RESEND_API_KEY;
    }

    // 2. Calculate Result
    const result = calculateScore(test_name, answers);

    // 3. Send Email
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
      } catch (e) { 
        console.error('Email error:', e); 
      }
    }

    // 4. Save to DB
    if (db) {
      try {
        await db.prepare('INSERT INTO submissions (test_name, email, score_json, level, raw_answers, email_sent) VALUES (?, ?, ?, ?, ?, ?)')
          .bind(test_name, email, JSON.stringify(result.score_json), result.level, JSON.stringify(answers), emailSent ? 1 : 0)
          .run();
      } catch (dbE) { 
        console.error('DB error:', dbE); 
      }
    }

    return new Response(JSON.stringify({ success: true, result, email_sent: emailSent }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (err: any) {
    console.error('API Error:', err);
    return new Response(JSON.stringify({ error: err.message || 'Internal Server Error' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
};
