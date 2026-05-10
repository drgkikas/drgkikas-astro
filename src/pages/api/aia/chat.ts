import type { APIRoute } from 'astro';
import { env } from 'cloudflare:workers';
import { retrieveContext } from '../../../lib/aia/engine';

export const POST: APIRoute = async ({ request, locals }) => {
  try {
    const { messages, lang } = await request.json();
    const userMessage = messages[messages.length - 1].content;

    // 1. Crisis Detection (Strict Protocol)
    const crisisKeywords = [
      'αυτοκτονία', 'θάνατο', 'τελος', 'να πεθάνω', 'κακό στον εαυτό μου', 
      'suicide', 'kill myself', 'die', 'harm myself', 
      'suicidio', 'uccidermi', 'morire'
    ];
    const isCrisis = crisisKeywords.some(word => userMessage.toLowerCase().includes(word));

    if (isCrisis) {
      return new Response(JSON.stringify({
        content: "Αν αισθάνεστε ότι βρίσκεστε σε έντονη ψυχολογική πίεση ή χρειάζεστε άμεση υποστήριξη, μπορείτε να καλέσετε τη γραμμή 10306. Αν υπάρχει άμεσος κίνδυνος για τη ζωή ή τη σωματική ακεραιότητα, αναζητήστε άμεσα επείγουσα βοήθεια.",
        isCrisis: true
      }), { status: 200 });
    }

    // 2. Retrieve Context (3-6 chunks as per Master Prompt)
    const contextChunks = retrieveContext(userMessage, 5, lang || 'el');
    const contextText = contextChunks.map(c => `[SOURCE: ${c.title} (${c.url})]: ${c.text}`).join('\n\n');

    // 3. Master System Prompt
    const systemPrompt = `
You are AIA, the AI Information Assistant of drgkikas.com. 
You provide general information based primarily on the website content. 

STRICT MEDICAL SAFETY RULES:
- DO NOT DIAGNOSE: You do not replace psychiatric evaluation. If asked "Do I have ADHD?", explain common symptoms and direct to assessment pages.
- NO MEDICATION: Do not prescribe, change, or recommend stopping medication.
- NO TREATMENT PROMISES: Do not guarantee cures.
- CRISIS: If the user describes acute crisis, self-harm, suicidal ideation, or immediate danger, provide the 10306 support message EXACTLY as defined.
- Provide internal links to drgkikas.com using markdown: [Title](URL).
- NAVIGATION GOAL: Your primary goal is to help the user explore the website content. Always prioritize linking to the specific service or disorder page discussed.
- DO NOT default to the contact page unless the user specifically asks "how to book" or is in a crisis.
- CROSS-LINKING: Suggest related content to keep the user reading (e.g., if talking about rTMS, mention [Motor Threshold](/rtms/pos-leitourgei/motor-threshold) or [MEP](/rtms/pos-leitourgei/mep)).
- IMPORTANT: Links MUST match the detected language:
    * Greek (default): /rtms, /diataraxes/katathlipsi, /ypiresies/pgx, /KnowledgeBase-eBooks, /epikoinonia
    * English: /en/rtms, /en/disorders/katathlipsi, /en/ypiresies/pgx, /en/contact
    * Italian: /it/rtms, /it/disturbi/depressione, /it/servizi/pgx, /it/contatti
- If unsure about a localized URL, use the relative path provided in the context chunks.
- SOURCE OF TRUTH: Answer ONLY from the provided context. If the website context is insufficient, say so and suggest related sections.

TONE & STYLE:
- Professional, calm, direct, medically responsible. 
- Match the user's language.
- Response should be concise but informative, encouraging the user to read more on the site.

- CONTEXTUAL PROACTIVE ENGAGEMENT: After answering, suggest ONE specific topic that is LOGICALLY RELATED to the current discussion.
    * Example: If talking about rTMS, suggest [Motor Threshold](/rtms/pos-leitourgei/motor-threshold) or [Safety](/rtms/core/asfaleia-parenergeies).
    * Example: If talking about Depression, suggest [TRD](/rtms/endixeis/trd) or [Pharmacogenomics (PGx)](/ypiresies/pgx).
    * Phrase it as: "Θα θέλατε να μάθετε περισσότερα για το [Θέμα](URL);"

RESPONSE FORMAT:
- Use bullet points for symptoms or features.
- Always include "Διαβάστε περισσότερα:" or "Σχετική πληροφορία:" με σύνδεσμο στην αντίστοιχη σελίδα.
- End with a proactive suggestion for the next topic to explore.
- Avoid repeating "Contact us" at the end of every message.

KNOWLEDGE CONTEXT:
${contextText}

REQUIRED REFUSALS:
- Medication: "Δεν μπορώ να σας πω να διακόψετε ή να αλλάξετε φαρμακευτική αγωγή. Αυτό πρέπει να το συζητήσετε με τον γιατρό σας."
- Diagnosis: "Δεν μπορώ να κάνω διάγνωση. Μπορώ όμως να σας εξηγήσω ποια συμπτώματα συχνά οδηγούν σε αξιολόγηση και να σας παραπέμψω στη σχετική σελίδα."
`;

    // 4. API Call (Updated for Astro v6 + Cloudflare Workers)
    const apiKey = (env as any).OPENAI_API_KEY || import.meta.env.OPENAI_API_KEY || process.env.OPENAI_API_KEY;
    
    console.log('AIA API Key loaded:', apiKey ? `Yes (${apiKey.substring(0, 7)}...)` : 'No');

    if (!apiKey) {
      const availableKeys = context?.runtime?.env ? Object.keys(context.runtime.env) : 'env_missing';
      console.error('AIA API Error: OPENAI_API_KEY is missing. Available keys:', availableKeys);
      throw new Error(`API Key configuration error. Available env keys: ${JSON.stringify(availableKeys)}`);
    }

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: systemPrompt },
          ...messages
        ],
        temperature: 0.2
      })
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('OpenAI API Error Details:', JSON.stringify(errorData, null, 2));
      throw new Error(`OpenAI API responded with status ${response.status}: ${JSON.stringify(errorData)}`);
    }

    const data = await response.json();
    const assistantContent = data.choices[0].message.content;

    return new Response(JSON.stringify({
      content: assistantContent,
      sources: contextChunks.map(c => ({ title: c.title, url: c.url }))
    }), { status: 200 });

  } catch (error) {
    console.error('AIA API Error:', error);
    if (error instanceof Error) {
      console.error('Error message:', error.message);
      console.error('Error stack:', error.stack);
    }
    return new Response(JSON.stringify({ 
      error: 'Δεν μπόρεσα να ολοκληρώσω την απάντηση. Μπορείτε να δοκιμάσετε ξανά ή να επικοινωνήσετε με το ιατρείο.',
      debug: error instanceof Error ? error.message : String(error)
    }), { status: 500 });
  }
};
