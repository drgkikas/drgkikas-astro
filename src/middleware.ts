import { defineMiddleware } from 'astro:middleware';

export const onRequest = defineMiddleware(async (context, next) => {
  const response = await next();

  // Ασφάλεια εναντίον XSS (Content-Security-Policy)
  response.headers.set(
    'Content-Security-Policy',
    "default-src 'self'; script-src 'self' 'unsafe-inline' https://analytics.ahrefs.com; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; img-src 'self' data: blob: https:; connect-src 'self' https://analytics.ahrefs.com; font-src 'self' data: https://fonts.gstatic.com; object-src 'none'; base-uri 'self'; frame-src 'self' https://maps.google.com https://www.google.com; frame-ancestors 'none'; form-action 'self'; upgrade-insecure-requests;"
  );

  // Ασφάλεια εναντίον MIME-Sniffing
  response.headers.set('X-Content-Type-Options', 'nosniff');

  // Ασφάλεια εναντίον Clickjacking (Σε συνδυασμό με frame-ancestors)
  response.headers.set('X-Frame-Options', 'DENY');

  // Strict HTTPS Pipelining
  response.headers.set('Strict-Transport-Security', 'max-age=31536000; includeSubDomains; preload');

  // Privacy headers
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  response.headers.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=(), payment=(), usb=()');

  return response;
});
