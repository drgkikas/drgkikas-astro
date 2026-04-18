// src/pages/api/contact.ts
// SSR endpoint — handles contact form submissions
// Sends email via Resend to the doctor and CCs his Gmail

export const prerender = false;

import type { APIRoute } from 'astro';

export const POST: APIRoute = async ({ request, locals }) => {
  try {
    const body = await request.json();
    const { firstname, lastname, email, phone, message } = body;

    // 1. Basic Validation
    if (!firstname || !lastname || !email || !message) {
      return new Response(JSON.stringify({ error: 'Παρακαλούμε συμπληρώστε όλα τα υποχρεωτικά πεδία.' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // 2. Send email via Resend
    const resendKey = (locals as Record<string, unknown>).runtime?.env?.RESEND_API_KEY as string | undefined;

    if (!resendKey) {
      console.error('RESEND_API_KEY is missing');
      return new Response(JSON.stringify({ error: 'Υπήρξε ένα πρόβλημα με την αποστολή. Παρακαλούμε προσπαθήστε ξανά αργότερα.' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const emailHtml = `
      <div style="font-family: sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; border: 1px solid #eee; border-radius: 10px; overflow: hidden;">
        <div style="background-color: #084a79; padding: 20px; color: white;">
          <h1 style="margin: 0; font-size: 24px;">Νέο Μήνυμα Επικοινωνίας</h1>
        </div>
        <div style="padding: 30px;">
          <p><strong>Όνομα:</strong> ${firstname} ${lastname}</p>
          <p><strong>Email:</strong> <a href="mailto:${email}">${email}</a></p>
          <p><strong>Τηλέφωνο:</strong> ${phone || 'Δεν δηλώθηκε'}</p>
          <hr style="border: 0; border-top: 1px solid #eee; margin: 20px 0;">
          <p><strong>Μήνυμα:</strong></p>
          <p style="white-space: pre-wrap; background: #f9f9f9; padding: 15px; border-radius: 8px;">${message}</p>
        </div>
        <div style="background-color: #f4f4f4; padding: 15px; text-align: center; font-size: 12px; color: #777;">
          <p>Αυτό το μήνυμα στάλθηκε αυτόματα από την ιστοσελίδα drgkikas.com</p>
        </div>
      </div>
    `;

    const resendRes = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${resendKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: 'Δρ. Γκίκας Φόρμα <noreply@drgkikas.com>',
        to: ['contact@drgkikas.com', 'paschalis.gkikas@gmail.com'],
        subject: `Νέο Μήνυμα από ${firstname} ${lastname}`,
        html: emailHtml,
        reply_to: email as string,
      }),
    });

    if (!resendRes.ok) {
      const errorData = await resendRes.json();
      console.error('Resend API Error:', errorData);
      throw new Error('Email delivery failed');
    }

    return new Response(JSON.stringify({ success: true, message: 'Το μήνυμά σας στάλθηκε με επιτυχία!' }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });

  } catch (err) {
    console.error('Contact API error:', err);
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};
