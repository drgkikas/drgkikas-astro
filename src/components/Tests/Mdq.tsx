import { useState, useEffect } from 'react';
import { calcScore } from '../../lib/clientScoring';

const APPT_LINK = 'https://appt.link/meet-with-paschalis-gkikas/therapy-session';

const partAQuestions = [
  'Αισθανόσασταν τόσο ζωηρός/ή, αισιόδοξος/η και ενεργητικός/η ώστε οι άλλοι να σας λένε ότι δεν ήσαστε ο εαυτός σας;',
  'Ήσαστε ευέξαπτος/η ή εκνευρισμένος/η τόσο ώστε να προκαλείτε διαμάχες ή να φωνάζετε;',
  'Ένιωθε ότι είστε πολύ πιο σίγουρος/η για τον εαυτό σας από το συνηθισμένο;',
  'Κοιμόσαστε πολύ λιγότερο από το συνηθισμένο χωρίς να νιώθετε ανάγκη για ύπνο;',
  'Ήσαστε πολύ πιο ομιλητικός/ή ή μιλούσατε πολύ πιο γρήγορα από το συνηθισμένο;',
  'Οι σκέψεις σας τρέχανε — σκεφτόσαστε γρήγορα και δεν μπορούσατε να τις επιβραδύνετε;',
  'Αποσπόσαστε εύκολα από δραστηριότητες ή πράγματα γύρω σας χωρίς έντονη προσπάθεια;',
  'Ήσαστε πολύ πιο δραστήριος/α τόσο κοινωνικά όσο και σεξουαλικά, ή απασχολημένος/η με περισσότερα σχέδια;',
  'Κάνατε πράγματα που κανονικά δεν θα κάνατε ή που ίσως να σας δημιούργησαν πρόβλημα (π.χ. ξόδεψε αλόγιστα, οδηγούσατε απρόσεκτα);',
  'Χρειαστήκατε τόσο λίγο ύπνο ώστε να κοιμάστε μόνο 3-4 ώρες;',
  'Νιώσατε τόσο ευτυχισμένος/η ή διασκεδαστικός/ή ώστε οι άλλοι να ανησυχούν;',
  'Νιώσατε σαν ήρωας ή κομβικό πρόσωπο;',
  'Ήσαστε άλλος/η άνθρωπος από ό,τι συνήθως;',
];

const partCOptions = [
  { label: 'Καθόλου/Ελάχιστα', value: 'none' },
  { label: 'Μικρές δυσκολίες', value: 'minor' },
  { label: 'Μέτριες δυσκολίες', value: 'moderate' },
  { label: 'Σοβαρές δυσκολίες', value: 'serious' },
];

export default function Mdq() {
  const [partA, setPartA] = useState<(boolean | null)[]>(Array(13).fill(null));
  const [partB, setPartB] = useState<boolean | null>(null);
  const [partC, setPartC] = useState<string | null>(null);
  const [email, setEmail] = useState('');
  const [state, setState] = useState<'quiz' | 'submitting' | 'done' | 'error'>('quiz');
  const [result, setResult] = useState<any>(null);
  const [emailSent, setEmailSent] = useState(false);
  const [turnstileToken, setTurnstileToken] = useState<string | null>(null);

  const partADone = partA.every(v => v !== null);
  const allDone = partADone && partB !== null && partC !== null;
  const answered = partA.filter(v => v !== null).length + (partB !== null ? 1 : 0) + (partC !== null ? 1 : 0);
  const total = 15;
  const progress = Math.round((answered / total) * 100);

  useEffect(() => {
    const handleTurnstile = (e: any) => setTurnstileToken(e.detail.token);
    window.addEventListener('turnstile-success', handleTurnstile);
    return () => window.removeEventListener('turnstile-success', handleTurnstile);
  }, []);

  // Simple fallback: unlock button after 2s if no token
  useEffect(() => {
    if (allDone && !turnstileToken) {
      const t = setTimeout(() => setTurnstileToken(prev => prev || 'fallback-token'), 2000);
      return () => clearTimeout(t);
    }
  }, [allDone, turnstileToken]);

  const handleSubmit = async () => {
    if (!allDone || !email) return;
    setState('submitting');
    const answers = { partA: partA as boolean[], partB: partB as boolean, partC: partC as string };
    const localResult = calcScore('mdq', answers);
    setResult(localResult);

    try {
      const res = await fetch('/api/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ test_name: 'mdq', email, answers, turnstile_token: turnstileToken }),
      });
      const data = await res.json();
      setEmailSent(!!data.email_sent);
    } catch (e) {
      console.error('Submit Error', e);
    }
    setState('done');
  };

  if (state === 'done' && result) {
    const isPositive = result.level === 'positive';
    const s = result.score_json;
    return (
      <div className="space-y-6 animate-fade-in">
        <div className={`flex items-center gap-3 p-4 rounded-xl border ${isPositive ? 'bg-amber-50 border-amber-200' : 'bg-emerald-50 border-emerald-200'}`}>
          <div>
            <p className="text-xs font-bold uppercase tracking-wider opacity-60">Αποτέλεσμα MDQ</p>
            <p className={`font-bold text-lg ${isPositive ? 'text-amber-700' : 'text-emerald-700'}`}>
              {isPositive ? 'Θετικό' : 'Αρνητικό'}
            </p>
          </div>
        </div>
        <div className="bg-white border border-slate-200 rounded-xl p-6 space-y-2 text-sm text-slate-600">
          <div className="flex justify-between"><span>Συμπτώματα Μέρους Α</span><strong>{String(s.part_a_yes_count)}/13</strong></div>
          <div className="flex justify-between"><span>Πύλη 1 (≥7 συμπτώματα)</span><strong className={s.gate1 ? 'text-emerald-600':'text-slate-400'}>{s.gate1?'✓':'✗'}</strong></div>
          <div className="flex justify-between"><span>Πύλη 2 (ταυτόχρονα)</span><strong className={s.gate2 ? 'text-emerald-600':'text-slate-400'}>{s.gate2?'✓':'✗'}</strong></div>
          <div className="flex justify-between"><span>Πύλη 3 (πρόβλημα)</span><strong className={s.gate3 ? 'text-emerald-600':'text-slate-400'}>{s.gate3?'✓':'✗'}</strong></div>
        </div>
        <div className="bg-white border p-6 rounded-xl text-center">
          <p className="text-sm text-slate-500 mb-4">{emailSent ? `Αποτελέσματα στάλθηκαν στο ${email}` : 'Τα αποτελέσματα είναι έτοιμα (το email καθυστερεί).'}</p>
          {isPositive
            ? <a href={APPT_LINK} target="_blank" rel="noopener noreferrer" className="text-blue-600 font-bold hover:underline">Κλείστε Ραντεβού →</a>
            : <a href="https://drgkikas.com/epikoinonia" className="text-blue-600 font-bold hover:underline">Επικοινωνήστε μαζί μου →</a>
          }
        </div>
        <button onClick={() => { setPartA(Array(13).fill(null)); setPartB(null); setPartC(null); setState('quiz'); setResult(null); }} className="text-sm text-slate-400 hover:text-slate-600 underline">Επανάληψη</button>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fade-in">
      <div>
        <h2 className="text-2xl font-bold text-blue-900">MDQ</h2>
        <p className="text-slate-600 mt-1 text-sm">Ερωτηματολόγιο Διαταραχής Διάθεσης</p>
      </div>

      <div>
        <div className="flex justify-between text-xs text-slate-400 mb-1"><span>{answered}/{total}</span><span>{progress}%</span></div>
        <div className="h-2 bg-slate-100 rounded-full overflow-hidden"><div className="h-full bg-blue-600 transition-all" style={{width:`${progress}%`}} /></div>
      </div>

      <div>
        <p className="text-sm font-bold text-slate-700 mb-4 uppercase">Μέρος Α — Ποτέ στη ζωή σας, έχετε βιώσει μια περίοδο όπου...</p>
        <div className="space-y-4">
          {partAQuestions.map((q, i) => (
            <div key={i} className={`p-4 rounded-xl border transition-all ${partA[i] !== null ? 'border-blue-200 bg-blue-50' : 'border-slate-200 bg-white'}`}>
              <p className="font-medium text-slate-800 mb-3 text-sm"><span className="text-blue-600 font-bold mr-2">{i+1}.</span>{q}</p>
              <div className="flex gap-3">
                {[{ label:'Ναι', value:true }, { label:'Όχι', value:false }].map(opt => (
                  <button key={String(opt.value)} onClick={() => { const n=[...partA]; n[i]=opt.value; setPartA(n); }}
                    className={`flex-1 py-2 rounded-lg border text-sm font-medium ${partA[i]===opt.value ? 'bg-blue-700 text-white' : 'bg-white text-slate-600 hover:border-blue-400'}`}>
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className={`p-5 rounded-xl border transition-all ${partB !== null ? 'border-blue-200 bg-blue-50' : 'border-slate-200 bg-white'}`}>
        <p className="font-bold text-slate-800 mb-1">Μέρος Β</p>
        <p className="text-sm text-slate-600 mb-4">Αν ναι στο Μέρος Α — συνέβησαν ταυτόχρονα πολλά από αυτά τα συμπτώματα;</p>
        <div className="flex gap-3">
          {[{ label:'Ναι', value:true }, { label:'Όχι', value:false }].map(opt => (
            <button key={String(opt.value)} onClick={() => setPartB(opt.value)}
              className={`flex-1 py-2 rounded-lg border text-sm font-medium ${partB===opt.value ? 'bg-blue-700 text-white' : 'bg-white text-slate-600 hover:border-blue-400'}`}>
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      <div className={`p-5 rounded-xl border transition-all ${partC !== null ? 'border-blue-200 bg-blue-50' : 'border-slate-200 bg-white'}`}>
        <p className="font-bold text-slate-800 mb-1">Μέρος Γ</p>
        <p className="text-sm text-slate-600 mb-4">Πόσα προβλήματα σάς έχουν δημιουργήσει αυτά τα συμπτώματα;</p>
        <div className="flex flex-wrap gap-2">
          {partCOptions.map(opt => (
            <button key={opt.value} onClick={() => setPartC(opt.value)}
              className={`flex-1 min-w-[120px] py-2.5 px-3 rounded-lg border text-sm font-medium text-center ${partC===opt.value ? 'bg-blue-700 text-white' : 'bg-white text-slate-600 hover:border-blue-400'}`}>
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {allDone && (
        <div className="bg-slate-50 border border-slate-200 rounded-xl p-6 space-y-4 animate-fade-in">
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">Email για αποτελέσματα</label>
            <input type="email" value={email} onChange={e=>setEmail(e.target.value)} placeholder="Το email σας"
              className="w-full px-4 py-3 rounded-lg border border-slate-200 focus:ring-2 focus:ring-blue-500 outline-none" />
          </div>
          <div className="flex justify-center">
            <div className="cf-turnstile" data-sitekey="0x4AAAAAAA4_S437qf6B9A_E" data-callback="onTurnstileSuccess"></div>
          </div>
          <button onClick={handleSubmit} disabled={!email || state === 'submitting'}
            className="w-full py-4 bg-blue-700 text-white rounded-xl font-bold hover:bg-blue-800 disabled:opacity-50">
            {state === 'submitting' ? 'Επεξεργασία...' : 'Δες τα αποτελέσματα →'}
          </button>
        </div>
      )}
    </div>
  );
}
