import type { APIRoute } from 'astro';

import { retrieveContext } from '../../../lib/aia/engine';

export const POST: APIRoute = async ({ request, locals }) => {
  try {
    const { messages, lang } = await request.json();
    const userMessage = messages[messages.length - 1].content;
    console.log('[AIA DEBUG] userMessage:', userMessage, '| lang:', lang);

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

    // 1b. Booking Intent Detection (Server-side, before OpenAI)
    const exactButtonMessages = [
      'I would like to leave a message with AIA',
      'Vorrei lasciare un messaggio con AIA',
      'Θέλω να κρατήσετε εσείς το μήνυμα'
    ];
    
    const bookingKeywords = [
      'ραντεβού', 'κλείσω', 'κλείστε', 'επικοινωνία', 'επικοινωνήσω', 'επικοινωνήσωμε',
      'κλείσετε', 'θέλω να έρθω', 'θελω να ερθω', 'appointment', 'book', 'contact', 
      'prenota', 'appuntamento', 'contattare', 'μήνυμα', 'τηλεφωνήσω', 'καλέσω'
    ];
    
    // Skip booking intent if the user clicked the specific choice button
    const isBookingIntent = !exactButtonMessages.includes(userMessage) && 
                            bookingKeywords.some(word => userMessage.toLowerCase().includes(word));

    if (isBookingIntent) {
      const bookingQuestion = lang === 'en'
        ? `I can help you in two ways — which do you prefer?\n\n**Option 1:** I take a message for the clinic myself and forward your contact details directly.\n\n**Option 2:** I direct you to our [Contact Page](/en/contact) where you can fill out the form or find the phone number.`
        : lang === 'it'
        ? `Posso aiutarti in due modi — quale preferisci?\n\n**Opzione 1:** Prendo io un messaggio per la clinica e inoltro i tuoi dati di contatto direttamente.\n\n**Opzione 2:** Ti indirizzo alla nostra [Pagina Contatti](/it/contatti) dove puoi compilare il modulo o trovare il numero di telefono.`
        : `Μπορώ να σας βοηθήσω με δύο τρόπους — ποιον προτιμάτε;\n\n**Επιλογή 1:** Κρατώ εγώ ένα μήνυμα για το ιατρείο και προωθώ τα στοιχεία σας απευθείας.\n\n**Επιλογή 2:** Σας παραπέμπω στη [Σελίδα Επικοινωνίας](/epikoinonia) όπου μπορείτε να συμπληρώσετε τη φόρμα ή να βρείτε το τηλέφωνο.`;

      return new Response(JSON.stringify({
        content: bookingQuestion,
        isBookingChoice: true,
        lang: lang || 'el'
      }), { status: 200 });
    }

    // 2. Retrieve Context (3-6 chunks as per Master Prompt)
    const contextChunks = retrieveContext(userMessage, 5, lang || 'el');
    const contextText = contextChunks.map(c => `[SOURCE: ${c.title} (${c.url})]: ${c.text}`).join('\n\n');

    // 3. Master System Prompt
    const systemPrompt = `
You are AIA, the AI Information Assistant of drgkikas.com. 

1. LEAD CAPTURE (ABSOLUTE PRIORITY):
- Whenever a user wants to "book an appointment", "contact the doctor", "send a message", or "speak to someone", you MUST NOT just send them to the contact page.
- Instead, say: "Ευχαρίστως να κρατήσω ένα μήνυμα για το ιατρείο. Θα χρειαστώ το ονοματεπώνυμό σας και ένα τηλέφωνο ή email επικοινωνίας."
- COLLECT: Name, Contact Info, and the Message.
- USE TOOL: Call 'send_contact_email' ONLY after you have all three pieces of info.
- CONFIRM: "Ευχαριστώ! Τα στοιχεία σας και το μήνυμά σας στάλθηκαν στο ιατρείο. Θα επικοινωνήσουμε μαζί σας σύντομα."

2. SAFETY:
- NO Diagnosis. NO Medication changes. 
- CRISIS: If the user describes self-harm or immediate danger, provide the 10306 support message immediately.

3. INFORMATION & NAVIGATION:
- Provide general information based on the website content.
- Provide internal links to drgkikas.com using markdown: [Title](URL).
- NAVIGATION GOAL: Your primary goal is to help the user explore the website content. For booking or contact requests, ALWAYS follow the LEAD CAPTURE PROTOCOL above. IGNORE context links for booking.
- IMPORTANT: Links MUST match the detected language:
    * Greek (default): /rtms, /diataraxes/katathlipsi, /ypiresies/pgx, /KnowledgeBase-eBooks, /epikoinonia
    * English: /en/rtms, /en/disorders/katathlipsi, /en/ypiresies/pgx, /en/contact
    * Italian: /it/rtms, /it/disturbi/depressione, /it/servizi/pgx, /it/contatti
- If unsure about a localized URL, use the relative path provided in the context chunks.
- SOURCE OF TRUTH: Answer ONLY from the provided context.

TONE & STYLE:
- Professional, calm, direct, medically responsible. 
- Match the user's language.
- Response should be concise but informative, encouraging the user to read more on the site.

- CONTEXTUAL PROACTIVE ENGAGEMENT: After answering, suggest ONE specific topic that is LOGICALLY RELATED to the current discussion.
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
    const runtime = (locals as any).runtime;
    let apiKey = runtime?.env?.OPENAI_API_KEY || (import.meta as any).env?.OPENAI_API_KEY || (typeof process !== 'undefined' ? process.env.OPENAI_API_KEY : '');
    let resendKey = runtime?.env?.RESEND_API_KEY || (import.meta as any).env?.RESEND_API_KEY || (typeof process !== 'undefined' ? process.env.RESEND_API_KEY : '');
    
    console.log('[AIA DEBUG] API Key loaded:', !!apiKey, '| Resend Key loaded:', !!resendKey);

    if (!apiKey) {
      throw new Error(`API Key configuration error.`);
    }

    // Define Tools
    const tools = [
      {
        type: "function",
        function: {
          name: "send_contact_email",
          description: "Sends an email to the clinic with the user's contact information and message.",
          parameters: {
            type: "object",
            properties: {
              name: { type: "string", description: "The user's full name" },
              contact_info: { type: "string", description: "The user's email address or phone number" },
              message: { type: "string", description: "The content of the user's inquiry" }
            },
            required: ["name", "contact_info", "message"]
          }
        }
      }
    ];

    const openAiResponse = await fetch('https://api.openai.com/v1/chat/completions', {
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
        tools: tools,
        tool_choice: "auto",
        temperature: 0.2
      })
    });

    if (!openAiResponse.ok) {
      const errorData = await openAiResponse.json();
      throw new Error(`OpenAI API responded with status ${openAiResponse.status}: ${JSON.stringify(errorData)}`);
    }

    const data = await openAiResponse.json();
    let assistantMessage = data.choices[0].message;

    // Handle Tool Calls
    if (assistantMessage.tool_calls) {
      for (const toolCall of assistantMessage.tool_calls) {
        if (toolCall.function.name === 'send_contact_email') {
          const args = JSON.parse(toolCall.function.arguments);
          
          if (resendKey) {
            try {
              const emailHtml = `
                <div style="font-family: sans-serif; line-height: 1.6; color: #333;">
                  <h2 style="color: #084a79;">Νέο Μήνυμα από AIA Chatbot</h2>
                  <p><strong>Ονοματεπώνυμο:</strong> ${args.name}</p>
                  <p><strong>Επικοινωνία:</strong> ${args.contact_info}</p>
                  <hr style="border: 0; border-top: 1px solid #eee; margin: 20px 0;" />
                  <p><strong>Μήνυμα:</strong></p>
                  <p style="background: #f9f9f9; padding: 15px; border-radius: 8px;">${args.message}</p>
                </div>
              `;

              const resendResponse = await fetch('https://api.resend.com/emails', {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                  'Authorization': `Bearer ${resendKey}`
                },
                body: JSON.stringify({
                  from: 'AIA Assistant <notifications@drgkikas.com>',
                  to: ['contact@drgkikas.com'],
                  subject: `Lead από AIA: ${args.name}`,
                  html: emailHtml
                })
              });
              
              if (!resendResponse.ok) {
                const errorText = await resendResponse.text();
                console.error('[AIA DEBUG] Resend API Error:', resendResponse.status, errorText);
              } else {
                console.log('[AIA DEBUG] AIA Lead Email sent successfully via Resend');
              }
            } catch (emailErr) {
              console.error('[AIA DEBUG] Failed to send lead email:', emailErr);
            }
          }

          // Return a second call to OpenAI to get the final response or just synthesize it
          // For simplicity and speed in a worker, we'll synthesize the confirmation response
          const confirmationText = lang === 'en' 
            ? `Thank you! Your details and message have been sent to the clinic. We will contact you soon.`
            : lang === 'it'
            ? `Grazie! I tuoi dati e il tuo messaggio sono stati inviati alla clinica. Ti contatteremo al più presto.`
            : `Ευχαριστώ! Τα στοιχεία σας και το μήνυμά σας στάλθηκαν στο ιατρείο. Θα επικοινωνήσουμε μαζί σας σύντομα.`;
          
          return new Response(JSON.stringify({
            content: confirmationText,
            sources: []
          }), { status: 200 });
        }
      }
    }

    const assistantContent = assistantMessage.content;

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
