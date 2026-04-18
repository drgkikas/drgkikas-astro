// ============================================================
// EMAIL LIBRARY — Templates for all 7 psychometric tests
// ============================================================

const APPT_LINK = 'https://appt.link/meet-with-paschalis-gkikas/therapy-session';

// ─── Common helpers ────────────────────────────────────────────
const levelGr: Record<string, string> = {
  normal: 'Φυσιολογικό', mild: 'Ήπιο', moderate: 'Μέτριο',
  severe: 'Σοβαρό', extreme: 'Ακραίο',
};
const domainGr: Record<string, string> = {
  depression: 'κατάθλιψης', anxiety: 'άγχους', stress: 'stress',
};

function footer() {
  return `
    <hr style="border:none;border-top:1px solid #e2e8f0;margin:40px 0 24px;">
    <p style="font-size:13px;color:#94a3b8;line-height:1.6;">
      Αυτό το αποτέλεσμα δεν αποτελεί διάγνωση και δεν υποκαθιστά την κλινική αξιολόγηση.<br>
      <a href="https://drgkikas.com" style="color:#3b82f6;">drgkikas.com</a> | Πασχάλης Γκίκας, Ψυχίατρος-ψυχοθεραπευτής
    </p>
  `;
}

function wrapper(content: string) {
  return `
    <!DOCTYPE html>
    <html lang="el">
    <head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
    <body style="margin:0;padding:0;background:#f8fafc;font-family:'Segoe UI',Arial,sans-serif;">
      <div style="max-width:600px;margin:32px auto;background:#ffffff;border-radius:16px;overflow:hidden;border:1px solid #e2e8f0;">
        <div style="background:linear-gradient(135deg,#1e3a5f 0%,#2563eb 100%);padding:32px 40px;">
          <p style="color:#93c5fd;font-size:12px;font-weight:600;letter-spacing:0.1em;text-transform:uppercase;margin:0 0 8px;">Αποτελέσματα Ψυχομετρικής Αξιολόγησης</p>
          <p style="color:#ffffff;font-size:14px;margin:0;opacity:0.85;">drgkikas.com — Πασχάλης Γκίκας, Ψυχίατρος-ψυχοθεραπευτής</p>
        </div>
        <div style="padding:40px;">
          ${content}
          ${footer()}
        </div>
      </div>
    </body>
    </html>
  `;
}

function ctaButton(text: string, url: string, color = '#2563eb') {
  return `<a href="${url}" style="display:inline-block;background:${color};color:#ffffff;padding:14px 28px;border-radius:10px;text-decoration:none;font-weight:600;font-size:15px;margin-top:24px;">${text}</a>`;
}

function scoreBox(label: string, score: number, levelKey: string) {
  const colors: Record<string, string> = {
    normal: '#10b981', mild: '#f59e0b', moderate: '#f59e0b',
    severe: '#ef4444', extreme: '#991b1b',
  };
  const color = colors[levelKey] ?? '#6b7280';
  return `
    <div style="display:flex;justify-content:space-between;align-items:center;padding:12px 16px;border-radius:8px;border:1px solid #e2e8f0;margin-bottom:10px;">
      <span style="font-weight:600;color:#1e293b;">${label}</span>
      <span style="padding:4px 12px;border-radius:20px;font-size:13px;font-weight:700;background:${color}20;color:${color};">${score} — ${levelGr[levelKey] ?? levelKey}</span>
    </div>
  `;
}

// ─── CTA logic by severity ──────────────────────────────────
function ctaByLevel(worstLevel: string) {
  const low = ['normal', 'minimal', 'low', 'negative'];
  const mid = ['mild', 'moderate', 'hazardous'];
  if (low.includes(worstLevel)) {
    return `<p style="color:#64748b;margin-top:24px;">Αν έχετε ερωτήσεις ή θέλετε να τα συζητήσουμε, μπορείτε να επικοινωνήσετε μαζί μου.</p>
            ${ctaButton('Επικοινωνήστε μαζί μου', 'https://drgkikas.com/epikoinonia', '#64748b')}`;
  }
  if (mid.includes(worstLevel)) {
    return `<p style="color:#64748b;margin-top:24px;">Θα χαρώ να τα συζητήσουμε σε μια συνεδρία αξιολόγησης.</p>
            ${ctaButton('Κλείστε Ραντεβού', APPT_LINK, '#2563eb')}`;
  }
  // severe / extreme / critical / harmful / dependent / positive
  return `<p style="color:#64748b;margin-top:24px;">Σας προτείνω να επικοινωνήσουμε σύντομα. Είμαι εδώ.</p>
          ${ctaButton('Κλείστε Ραντεβού', APPT_LINK, '#ef4444')}
          <p style="font-size:13px;color:#94a3b8;margin-top:12px;">Εάν χρειαστείτε υποστήριξη άμεσα: <strong>Γραμμή 10306</strong> (24ωρη, δωρεάν)</p>`;
}

// ============================================================
// DASS-21
// ============================================================
export function buildDass21Email(email: string, s: Record<string, unknown>) {
  const dLvl = s.depression_level as string;
  const aLvl = s.anxiety_level as string;
  const sLvl = s.stress_level as string;
  const worstLevel = s.worst_level as string;

  const worstDomainGr = worstLevel === dLvl ? domainGr.depression
    : worstLevel === aLvl ? domainGr.anxiety : domainGr.stress;

  const paragraphs: Record<string, string> = {
    normal: 'Τα αποτελέσματά σας κινούνται σε φυσιολογικά επίπεδα και στις τρεις διαστάσεις. Δεν φαίνεται να αντιμετωπίζετε σημαντικές δυσκολίες αυτή την περίοδο.',
    mild: 'Τα αποτελέσματά σας δείχνουν ήπια επίπεδα δυσκολίας. Αυτά συχνά έρχονται και φεύγουν — αν όμως παρατηρείτε ότι επιμένουν, αξίζει να τα προσέξετε.',
    moderate: `Τα αποτελέσματά σας δείχνουν μέτρια επίπεδα ${worstDomainGr} που μπορεί να επηρεάζουν την καθημερινότητά σας. Μια συζήτηση με ειδικό μπορεί να βοηθήσει.`,
    severe: `Τα αποτελέσματά σας δείχνουν σημαντικές δυσκολίες. Αυτά τα επίπεδα ${worstDomainGr} είναι αναγνωρίσιμα και αντιμετωπίσιμα — δεν χρειάζεται να τα διαχειρίζεστε μόνοι.`,
    extreme: `Τα αποτελέσματά σας δείχνουν έντονες δυσκολίες σε επίπεδο ${worstDomainGr}. Σας παρακαλώ μη τα αφήσετε μόνα — υπάρχει υποστήριξη.`,
  };

  const html = wrapper(`
    <h1 style="font-size:22px;font-weight:700;color:#1e3a5f;margin:0 0 8px;">Τα αποτελέσματά σας — DASS-21</h1>
    <p style="color:#64748b;font-size:14px;margin:0 0 28px;">Κλίμακα Κατάθλιψης, Άγχους &amp; Stress</p>
    ${scoreBox('Κατάθλιψη', s.depression as number, dLvl)}
    ${scoreBox('Άγχος', s.anxiety as number, aLvl)}
    ${scoreBox('Stress', s.stress as number, sLvl)}
    <div style="background:#f1f5f9;border-radius:12px;padding:20px;margin-top:24px;">
      <p style="color:#1e293b;line-height:1.7;margin:0;">${paragraphs[worstLevel] ?? paragraphs.moderate}</p>
    </div>
    ${ctaByLevel(worstLevel)}
  `);

  return { to: email, subject: 'Τα αποτελέσματά σας από το DASS-21', html };
}

// ============================================================
// PHQ-9
// ============================================================
export function buildPhq9Email(email: string, s: Record<string, unknown>) {
  const level = s.level as string;
  const total = s.total as number;
  const q9Flag = s.q9_flag as boolean;

  const paragraphs: Record<string, string> = {
    minimal: `Τα αποτελέσματά σας (${total}/27) δεν δείχνουν σημαντικά συμπτώματα κατάθλιψης αυτή τη στιγμή. Ένα κάποιο άγχος ή μελαγχολία στην καθημερινή ζωή είναι φυσιολογικά — αυτό που μετράμε εδώ είναι αν ξεπερνούν τα φυσιολογικά όρια.`,
    mild: `Τα αποτελέσματά σας (${total}/27) δείχνουν ήπια συμπτώματα κατάθλιψης. Αυτά συχνά σχετίζονται με στρεσογόνες περιόδους και μπορεί να υποχωρήσουν. Αν επιμένουν, αξίζει να τα μοιραστείτε με κάποιον.`,
    moderate: `Τα αποτελέσματά σας (${total}/27) δείχνουν μέτρια συμπτώματα κατάθλιψης που πιθανότατα επηρεάζουν κάποιες πτυχές της καθημερινότητάς σας — ενέργεια, διάθεση, συγκέντρωση. Αυτά τα συμπτώματα ανταποκρίνονται καλά στη σωστή υποστήριξη.`,
    moderately_severe: `Τα αποτελέσματά σας (${total}/27) δείχνουν σημαντικά συμπτώματα κατάθλιψης. Το γεγονός ότι το αναγνωρίζετε και το καταγράφετε είναι ήδη ένα βήμα. Με την κατάλληλη υποστήριξη, τα πράγματα μπορούν να αλλάξουν.`,
    severe: `Τα αποτελέσματά σας (${total}/27) δείχνουν έντονα συμπτώματα κατάθλιψης. Σας παρακαλώ μη τα αντιμετωπίσετε μόνοι — υπάρχει βοήθεια και αξίζει να τη ζητήσετε.`,
    critical: `Είδα ότι απαντήσατε θετικά στην ερώτηση για σκέψεις αυτοτραυματισμού. Θέλω να ξέρετε ότι το παρατηρώ και νοιάζομαι. Αν κάποια στιγμή νιώσετε ότι χρειάζεστε κάποιον άμεσα, η <strong>γραμμή 10306</strong> είναι διαθέσιμη 24 ώρες το 24ωρο, δωρεάν.`,
  };

  const subjects: Record<string, string> = {
    minimal: 'Τα αποτελέσματά σας από το PHQ-9',
    mild: 'Τα αποτελέσματά σας από το PHQ-9',
    moderate: 'Τα αποτελέσματά σας από το PHQ-9 — Αξίζει να μιλήσουμε',
    moderately_severe: 'Τα αποτελέσματά σας από το PHQ-9 — Αξίζει να μιλήσουμε',
    severe: 'Τα αποτελέσματά σας από το PHQ-9',
    critical: 'Τα αποτελέσματά σας από το PHQ-9',
  };

  const html = wrapper(`
    <h1 style="font-size:22px;font-weight:700;color:#1e3a5f;margin:0 0 8px;">Τα αποτελέσματά σας — PHQ-9</h1>
    <p style="color:#64748b;font-size:14px;margin:0 0 28px;">Κλίμακα Αξιολόγησης Κατάθλιψης</p>
    ${!q9Flag ? `<div style="background:#f1f5f9;border-radius:12px;padding:16px 20px;margin-bottom:24px;text-align:center;">
      <span style="font-size:28px;font-weight:700;color:#1e3a5f;">${total}</span>
      <span style="color:#64748b;font-size:16px;">/27</span>
    </div>` : ''}
    <div style="background:#f1f5f9;border-radius:12px;padding:20px;margin-bottom:24px;">
      <p style="color:#1e293b;line-height:1.7;margin:0;">${paragraphs[level] ?? paragraphs.moderate}</p>
    </div>
    ${q9Flag
      ? `${ctaButton('Κλείστε Ραντεβού', APPT_LINK, '#ef4444')}
         <p style="font-size:13px;color:#94a3b8;margin-top:12px;"><strong>Γραμμή 10306</strong> — διαθέσιμη 24ωρη, δωρεάν</p>`
      : ctaByLevel(level)
    }
  `);

  return { to: email, subject: subjects[level] ?? subjects.minimal, html };
}

// ============================================================
// GAD-7
// ============================================================
export function buildGad7Email(email: string, s: Record<string, unknown>) {
  const level = s.level as string;
  const total = s.total as number;

  const paragraphs: Record<string, string> = {
    minimal: `Τα αποτελέσματά σας (${total}/21) δεν δείχνουν σημαντικά επίπεδα άγχους αυτή τη στιγμή. Ένα κάποιο άγχος στην καθημερινή ζωή είναι φυσιολογικό — αυτό που μετράμε εδώ είναι αν ξεπερνά τα φυσιολογικά όρια.`,
    mild: `Τα αποτελέσματά σας (${total}/21) δείχνουν ήπια επίπεδα άγχους. Αυτά συχνά εμφανίζονται σε περιόδους αυξημένης πίεσης και μπορεί να υποχωρήσουν μόνα τους. Αξίζει να τα παρακολουθείτε.`,
    moderate: `Τα αποτελέσματά σας (${total}/21) δείχνουν μέτρια επίπεδα άγχους. Αυτό συχνά σημαίνει ότι το άγχος παρεισφρέει στην καθημερινότητα — στη συγκέντρωση, τον ύπνο ή τις σχέσεις — χωρίς απαραίτητα να είναι πάντα εμφανές.`,
    severe: `Τα αποτελέσματά σας (${total}/21) δείχνουν υψηλά επίπεδα άγχους. Το άγχος σε αυτό το επίπεδο μπορεί να είναι εξαντλητικό — και ταυτόχρονα αντιμετωπίσιμο με τη σωστή υποστήριξη.`,
  };

  const html = wrapper(`
    <h1 style="font-size:22px;font-weight:700;color:#1e3a5f;margin:0 0 8px;">Τα αποτελέσματά σας — GAD-7</h1>
    <p style="color:#64748b;font-size:14px;margin:0 0 28px;">Κλίμακα Γενικευμένου Άγχους</p>
    <div style="background:#f1f5f9;border-radius:12px;padding:16px 20px;margin-bottom:24px;text-align:center;">
      <span style="font-size:28px;font-weight:700;color:#1e3a5f;">${total}</span>
      <span style="color:#64748b;font-size:16px;">/21 — ${levelGr[level] ?? level}</span>
    </div>
    <div style="background:#f1f5f9;border-radius:12px;padding:20px;margin-bottom:24px;">
      <p style="color:#1e293b;line-height:1.7;margin:0;">${paragraphs[level] ?? paragraphs.moderate}</p>
    </div>
    ${ctaByLevel(level)}
  `);

  return { to: email, subject: 'Τα αποτελέσματά σας από το GAD-7', html };
}

// ============================================================
// MDQ
// ============================================================
export function buildMdqEmail(email: string, s: Record<string, unknown>) {
  const result = s.result as string;
  const isPositive = result === 'positive';

  const paragraphs = {
    negative: 'Τα αποτελέσματά σας δεν δείχνουν ενδείξεις που σχετίζονται με διπολική διαταραχή. Αυτό σημαίνει ότι οι απαντήσεις σας δεν πληρούν τα κριτήρια για σημαντικές εναλλαγές διάθεσης. Αν έχετε απορίες, μπορούμε να τα συζητήσουμε.',
    positive: 'Τα αποτελέσματά σας δείχνουν ενδείξεις που σχετίζονται με εναλλαγές διάθεσης — περιόδους υπερενεργητικότητας, αυξημένης ενέργειας ή ευερεθιστότητας. Αυτό δεν είναι διάγνωση — είναι ένα σήμα που αξίζει να εξεταστεί από κοντά. Πολλοί άνθρωποι με παρόμοια αποτελέσματα ζουν καλά όταν λάβουν τη σωστή υποστήριξη.',
  };

  const resultLabel = isPositive
    ? '<span style="color:#ef4444;font-weight:700;">Θετικό</span>'
    : '<span style="color:#10b981;font-weight:700;">Αρνητικό</span>';

  const html = wrapper(`
    <h1 style="font-size:22px;font-weight:700;color:#1e3a5f;margin:0 0 8px;">Τα αποτελέσματά σας — MDQ</h1>
    <p style="color:#64748b;font-size:14px;margin:0 0 28px;">Ερωτηματολόγιο Διαταραχής Διάθεσης (Διπολική)</p>
    <div style="background:#f1f5f9;border-radius:12px;padding:16px 20px;margin-bottom:24px;text-align:center;">
      <p style="margin:0;font-size:16px;">Αποτέλεσμα: ${resultLabel}</p>
    </div>
    <div style="background:#f1f5f9;border-radius:12px;padding:20px;margin-bottom:24px;">
      <p style="color:#1e293b;line-height:1.7;margin:0;">${paragraphs[result as keyof typeof paragraphs] ?? paragraphs.negative}</p>
    </div>
    ${ctaByLevel(result)}
  `);

  return {
    to: email,
    subject: isPositive
      ? 'Τα αποτελέσματά σας από το MDQ — Αξίζει να μιλήσουμε'
      : 'Τα αποτελέσματά σας από το MDQ',
    html,
  };
}

// ============================================================
// ASRS
// ============================================================
export function buildAsrsEmail(email: string, s: Record<string, unknown>) {
  const result = s.result as string;
  const isPositive = result === 'positive';

  const paragraphs = {
    negative: 'Τα αποτελέσματά σας δεν δείχνουν ενδείξεις ADHD σύμφωνα με το κύριο τμήμα του ερωτηματολογίου. Αυτό σημαίνει ότι τα συμπτώματα απροσεξίας ή υπερκινητικότητας που αναφέρατε δεν φτάνουν στο επίπεδο που συνδέεται με ADHD.',
    positive: 'Τα αποτελέσματά σας δείχνουν ενδείξεις συμπτωμάτων που σχετίζονται με ADHD — δυσκολίες στην οργάνωση, την ολοκλήρωση εργασιών ή/και στην αίσθηση εσωτερικής ανησυχίας. Αυτό δεν είναι διάγνωση. Το ADHD στους ενήλικες συχνά περνά απαρατήρητο και μπορεί να επηρεάζει σημαντικές πτυχές της καθημερινής ζωής.',
  };

  const html = wrapper(`
    <h1 style="font-size:22px;font-weight:700;color:#1e3a5f;margin:0 0 8px;">Τα αποτελέσματά σας — ASRS-v1.1</h1>
    <p style="color:#64748b;font-size:14px;margin:0 0 28px;">Κλίμακα Αυτοαναφοράς ADHD ενηλίκων (WHO)</p>
    <div style="background:#f1f5f9;border-radius:12px;padding:16px 20px;margin-bottom:24px;text-align:center;">
      <p style="margin:0;font-size:16px;">Αποτέλεσμα: ${isPositive
        ? '<span style="color:#ef4444;font-weight:700;">Θετικό</span>'
        : '<span style="color:#10b981;font-weight:700;">Αρνητικό</span>'}</p>
    </div>
    <div style="background:#f1f5f9;border-radius:12px;padding:20px;margin-bottom:24px;">
      <p style="color:#1e293b;line-height:1.7;margin:0;">${paragraphs[result as keyof typeof paragraphs] ?? paragraphs.negative}</p>
    </div>
    ${ctaByLevel(result)}
  `);

  return {
    to: email,
    subject: isPositive
      ? 'Τα αποτελέσματά σας από το ASRS — Αξίζει να μιλήσουμε'
      : 'Τα αποτελέσματά σας από το ASRS',
    html,
  };
}

// ============================================================
// AUDIT
// ============================================================
export function buildAuditEmail(email: string, s: Record<string, unknown>) {
  const level = s.level as string;
  const total = s.total as number;

  const paragraphs: Record<string, string> = {
    low: `Τα αποτελέσματά σας (${total}/40) δείχνουν ότι η σχέση σας με το αλκοόλ κινείται σε ασφαλή επίπεδα.`,
    hazardous: `Τα αποτελέσματά σας (${total}/40) δείχνουν ότι η κατανάλωση αλκοόλ μπορεί να βρίσκεται σε επίπεδα που, με τον καιρό, επηρεάζουν την υγεία ή την καθημερινότητα. Αυτό δεν είναι κατηγορία — είναι πληροφορία που αξίζει να ληφθεί υπόψη.`,
    harmful: `Τα αποτελέσματά σας (${total}/40) δείχνουν ότι η κατανάλωση αλκοόλ επηρεάζει ήδη κάποιες πτυχές της ζωής σας. Αυτό συμβαίνει σε πολλούς ανθρώπους και δεν σημαίνει ότι δεν μπορεί να αλλάξει.`,
    dependent: `Τα αποτελέσματά σας (${total}/40) υποδηλώνουν ότι η σχέση με το αλκοόλ μπορεί να έχει φτάσει σε σημείο που χρειάζεται προσοχή. Το να το αναγνωρίζετε αυτό είναι ήδη σημαντικό.<br><br>Πηγή υποστήριξης: <strong>ΚΕΘΕΑ 210 924 1993</strong>`,
  };

  const subjects: Record<string, string> = {
    low: 'Τα αποτελέσματά σας από το AUDIT',
    hazardous: 'Τα αποτελέσματά σας από το AUDIT — Αξίζει να μιλήσουμε',
    harmful: 'Τα αποτελέσματά σας από το AUDIT — Αξίζει να μιλήσουμε',
    dependent: 'Τα αποτελέσματά σας από το AUDIT — Αξίζει να μιλήσουμε',
  };

  const html = wrapper(`
    <h1 style="font-size:22px;font-weight:700;color:#1e3a5f;margin:0 0 8px;">Τα αποτελέσματά σας — AUDIT</h1>
    <p style="color:#64748b;font-size:14px;margin:0 0 28px;">Κλίμακα Αναγνώρισης Επικίνδυνης Χρήσης Αλκοόλ (WHO)</p>
    <div style="background:#f1f5f9;border-radius:12px;padding:16px 20px;margin-bottom:24px;text-align:center;">
      <span style="font-size:28px;font-weight:700;color:#1e3a5f;">${total}</span>
      <span style="color:#64748b;font-size:16px;">/40</span>
    </div>
    <div style="background:#f1f5f9;border-radius:12px;padding:20px;margin-bottom:24px;">
      <p style="color:#1e293b;line-height:1.7;margin:0;">${paragraphs[level] ?? paragraphs.low}</p>
    </div>
    ${ctaByLevel(level)}
  `);

  return { to: email, subject: subjects[level] ?? subjects.low, html };
}

// ============================================================
// PCL-5
// ============================================================
export function buildPcl5Email(email: string, s: Record<string, unknown>) {
  const level = s.level as string;
  const total = s.total as number;

  const paragraphs: Record<string, string> = {
    minimal: `Τα αποτελέσματά σας (${total}/80) δεν δείχνουν σημαντικά συμπτώματα μετατραυματικού στρες αυτή τη στιγμή. Αν κάποια στιγμή νιώσετε ότι κάτι σας βαραίνει από το παρελθόν, μη διστάσετε να επικοινωνήσετε.`,
    moderate: `Τα αποτελέσματά σας (${total}/80) δείχνουν κάποια συμπτώματα που μπορεί να σχετίζονται με δύσκολες εμπειρίες — αναμνήσεις που επιστρέφουν, αποφυγή, ή αίσθημα επιφυλακής. Αυτά τα συναισθήματα είναι κατανοητά και αντιμετωπίσιμα.`,
    severe: `Τα αποτελέσματά σας (${total}/80) δείχνουν έντονα συμπτώματα που σχετίζονται με τραυματικές εμπειρίες. Ξέρω ότι το να φτάσει κανείς εδώ και να τα καταγράψει δεν είναι εύκολο — και αυτό από μόνο του είναι ένα βήμα.`,
  };

  const html = wrapper(`
    <h1 style="font-size:22px;font-weight:700;color:#1e3a5f;margin:0 0 8px;">Τα αποτελέσματά σας — PCL-5</h1>
    <p style="color:#64748b;font-size:14px;margin:0 0 28px;">Κλίμακα Μετατραυματικού Στρες (PTSD) — VA/DoD</p>
    <div style="background:#f1f5f9;border-radius:12px;padding:16px 20px;margin-bottom:24px;text-align:center;">
      <span style="font-size:28px;font-weight:700;color:#1e3a5f;">${total}</span>
      <span style="color:#64748b;font-size:16px;">/80</span>
    </div>
    <div style="background:#f1f5f9;border-radius:12px;padding:20px;margin-bottom:24px;">
      <p style="color:#1e293b;line-height:1.7;margin:0;">${paragraphs[level] ?? paragraphs.moderate}</p>
    </div>
    ${ctaByLevel(level)}
    ${level === 'severe' ? '<p style="font-size:13px;color:#94a3b8;margin-top:12px;"><strong>Γραμμή 10306</strong> — διαθέσιμη 24ωρη, δωρεάν</p>' : ''}
  `);

  return { to: email, subject: 'Τα αποτελέσματά σας από το PCL-5', html };
}

// ─── DISPATCHER ──────────────────────────────────────────────
export function buildEmail(testName: string, email: string, scoreJson: Record<string, unknown>) {
  const builders: Record<string, (e: string, s: Record<string, unknown>) => { to: string; subject: string; html: string }> = {
    dass21: buildDass21Email,
    phq9:   buildPhq9Email,
    gad7:   buildGad7Email,
    mdq:    buildMdqEmail,
    asrs:   buildAsrsEmail,
    audit:  buildAuditEmail,
    pcl5:   buildPcl5Email,
  };
  const builder = builders[testName];
  if (!builder) throw new Error(`No email builder for ${testName}`);
  return builder(email, scoreJson);
}
