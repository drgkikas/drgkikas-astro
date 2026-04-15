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
    const body = await request.json() as {
      test_name: TestName;
      email: string;
      answers: unknown;
    };

    const { test_name, email, answers } = body;

    if (!test_name || !email || !answers) {
      return new Response(JSON.stringify({ error: 'Missing required fields' }), {
        status: 400,
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
    const db = (locals as Record<string, unknown>).runtime?.env?.DB as D1Database | undefined;

    let rowId: number | null = null;
    if (db) {
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
    }

    // 4. Send email via Resend
    const resendKey = (locals as Record<string, unknown>).runtime?.env?.RESEND_API_KEY as string | undefined;

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
            from: 'Δρ. Γκίκας <noreply@drgkikas.com>',
            to: emailContent.to,
            subject: emailContent.subject,
            html: emailContent.html,
          }),
        });
        emailSent = resendRes.ok;

        // 5. Update email_sent flag
        if (emailSent && db && rowId) {
          await db.prepare('UPDATE submissions SET email_sent = 1 WHERE id = ?')
            .bind(rowId).run();
        }
      } catch (emailErr) {
        console.error('Email send failed:', emailErr);
        // Don't fail the whole request if email fails
      }
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
