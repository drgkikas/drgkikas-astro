// src/pages/api/submit.ts
// Astro SSR endpoint — handles psychometric form submissions
// Saves to D1, sends email via Resend

export const prerender = false;

import type { APIRoute } from 'astro';
import { calculateScore, type TestName } from '../../lib/scoring';
import { buildEmail } from '../../lib/emails';

const ALLOWED_ORIGINS = [
  'https://drgkikas.com',
  'https://www.drgkikas.com',
];

function getCorsHeaders(request: Request) {
  const origin = request.headers.get('Origin') ?? '';
  const allowedOrigin = ALLOWED_ORIGINS.includes(origin) ? origin : ALLOWED_ORIGINS[0];
  return {
    'Access-Control-Allow-Origin': allowedOrigin,
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Vary': 'Origin',
  };
}

export const OPTIONS: APIRoute = async ({ request }) => {
  return new Response(null, { status: 204, headers: getCorsHeaders(request) });
};

export const POST: APIRoute = async ({ request, locals }) => {
  const corsHeaders = getCorsHeaders(request);
  try {
    // 1. Parse body
    const body = await request.json() as any;
    const { test_name, email, answers, turnstile_token } = body;
    const ip = request.headers.get('CF-Connecting-IP') || '';

    if (!test_name || !email || !answers) {
      return new Response(JSON.stringify({ error: 'Missing required fields' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      });
    }

    // Turnstile Verification
    let turnstileSecret: string | undefined;
    let resendKey: string | undefined;
    let db: D1Database | undefined;

    // Standard Astro 6 + Cloudflare way to access env/bindings
    const runtime = (locals as any).runtime;
    if (runtime?.env) {
      turnstileSecret = runtime.env.TURNSTILE_SECRET_KEY;
      resendKey = runtime.env.RESEND_API_KEY;
      db = runtime.env.DB;
    }

    // Fallbacks (for local dev or other environments)
    turnstileSecret = turnstileSecret || (import.meta as any).env?.TURNSTILE_SECRET_KEY;
    resendKey = resendKey || (import.meta as any).env?.RESEND_API_KEY;
    
    const SECRET_KEY = turnstileSecret || '1x0000000000000000000000000000000AA';

    if (turnstile_token) {
      // Safety bypass for our frontend fallback
      if (turnstile_token === 'fallback-token') {
        console.log('Using safety fallback token, bypassing Cloudflare verify.');
      } else {
        console.log('Verifying Turnstile token...');
        const verifyRes = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            secret: SECRET_KEY,
            response: turnstile_token,
            remoteip: ip,
          }),
        });
        const verifyData = await verifyRes.json() as { success: boolean, 'error-codes'?: string[] };
        if (!verifyData.success) {
          console.error('Turnstile verification failed:', verifyData['error-codes']);
          return new Response(JSON.stringify({ error: 'Security verification failed', details: verifyData['error-codes'] }), {
            status: 403,
            headers: { 'Content-Type': 'application/json', ...corsHeaders },
          });
        }
        console.log('Turnstile verified successfully.');
      }
    } else {
      console.warn('Turnstile token missing in request');
      return new Response(JSON.stringify({ error: 'Security token missing' }), {
        status: 403,
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      });
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return new Response(JSON.stringify({ error: 'Invalid email' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      });
    }

    // 2. Calculate score
    const result = calculateScore(test_name, answers);

    // 3. Save to D1
    let rowId: number | null = null;
    if (db) {
      try {
        const insertResult = await db.prepare(`
          INSERT INTO submissions (test_name, email, score_json, level, raw_answers)
          VALUES (?, ?, ?, ?, ?)
        `).bind(
          test_name,
          email.toLowerCase().trim(),
          JSON.stringify(result.score_json),
          result.level,
          JSON.stringify(answers),
        ).run();
        rowId = insertResult.meta?.last_row_id ?? null;
      } catch (dbErr) {
        console.error('Database insertion failed:', dbErr);
      }
    }

    // 4. Send email via Resend
    let emailSent = false;
    if (resendKey) {
      try {
        const emailContent = buildEmail(test_name, email, result.score_json as Record<string, unknown>);
        const resendRes = await fetch('https://api.resend.com/emails', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${resendKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            from: 'drGkikas <noreply@drgkikas.com>',
            to: emailContent.to,
            subject: emailContent.subject,
            html: emailContent.html,
          }),
        });
        emailSent = resendRes.ok;
        if (!emailSent) {
          const errorData = await resendRes.json();
          console.error('Resend API error:', errorData);
        }

        // 5. Update email_sent flag
        if (emailSent && db && rowId) {
          await db.prepare('UPDATE submissions SET email_sent = 1 WHERE id = ?')
            .bind(rowId).run();
        }
      } catch (emailErr) {
        console.error('Email sending process failed:', emailErr);
      }
    } else {
      console.warn('RESEND_API_KEY is missing, skipping email.');
    }

    return new Response(JSON.stringify({
      success: true,
      result: {
        score_json: result.score_json,
        level: result.level,
      },
      email_sent: emailSent,
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json', ...corsHeaders },
    });

  } catch (err) {
    console.error('Submit error:', err);
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json', ...corsHeaders },
    });
  }
};
