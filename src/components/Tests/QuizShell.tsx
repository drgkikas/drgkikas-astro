import { useState, useEffect } from 'react';
import { calcScore, type TestName } from '../../lib/clientScoring';

// ─── Constants ────────────────────────────────────────────────
const LIKERT_4 = [
  { label: 'Καθόλου', value: 0 },
  { label: 'Λίγο', value: 1 },
  { label: 'Αρκετά', value: 2 },
  { label: 'Πολύ', value: 3 },
];

const LIKERT_5 = [
  { label: 'Καθόλου', value: 0 },
  { label: 'Λίγο', value: 1 },
  { label: 'Μέτρια', value: 2 },
  { label: 'Πολύ', value: 3 },
  { label: 'Πάρα πολύ', value: 4 },
];

// ─── Types ────────────────────────────────────────────────────
export interface QuizQuestion {
  text: string;
  type?: 'likert4' | 'likert5' | 'select';
  options?: { label: string; value: any }[];
}

interface Props {
  testName: TestName;
  title: string;
  subtitle?: string;
  progressNote?: string;
  questions: QuizQuestion[];
  getAnswers?: (raw: (number | null)[]) => any;
  renderResults: (score: any, level: string) => React.ReactNode;
}

const levelColors: Record<string, any> = {
  normal:   { bg: 'bg-emerald-50',  border: 'border-emerald-100', text: 'text-emerald-700', label: 'Φυσιολογικό' },
  minimal:  { bg: 'bg-emerald-50',  border: 'border-emerald-100', text: 'text-emerald-700', label: 'Ελάχιστο' },
  low:      { bg: 'bg-emerald-50',  border: 'border-emerald-100', text: 'text-emerald-700', label: 'Χαμηλό' },
  mild:     { bg: 'bg-amber-50',    border: 'border-amber-100',   text: 'text-amber-700',   label: 'Ήπιο' },
  moderate: { bg: 'bg-amber-50',    border: 'border-amber-100',   text: 'text-amber-700',   label: 'Μέτριο' },
  severe:   { bg: 'bg-rose-50',     border: 'border-rose-100',    text: 'text-rose-700',    label: 'Σοβαρό' },
  extreme:  { bg: 'bg-rose-100',    border: 'border-rose-200',    text: 'text-rose-900',    label: 'Ακραίο' },
  critical: { bg: 'bg-rose-100',    border: 'border-rose-200',    text: 'text-rose-900',    label: 'Κρίσιμο' },
};

export default function QuizShell({ testName, title, subtitle, progressNote, questions, getAnswers, renderResults }: Props) {
  const [raw, setRaw] = useState<(number | null)[]>(new Array(questions.length).fill(null));
  const [email, setEmail] = useState('');
  const [state, setState] = useState<'quiz' | 'submitting' | 'done'>('quiz');
  const [result, setResult] = useState<any>(null);
  const [emailSent, setEmailSent] = useState(false);
  const [turnstileToken, setTurnstileToken] = useState<string | null>(null);

  useEffect(() => {
    const handleTurnstile = (e: any) => setTurnstileToken(e.detail.token);
    window.addEventListener('turnstile-success', handleTurnstile);
    return () => window.removeEventListener('turnstile-success', handleTurnstile);
  }, []);

  // Fallback: αν το Turnstile δεν φορτωθεί σε 3 δευτερόλεπτα, ξεκλειδώνουμε την υποβολή
  useEffect(() => {
    const t = setTimeout(() => setTurnstileToken(prev => prev || 'fallback-token'), 3000);
    return () => clearTimeout(t);
  }, []);

  const handleAnswer = (index: number, val: number) => {
    const next = [...raw];
    next[index] = val;
    setRaw(next);
  };

  const isComplete = raw.every(v => v !== null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !isComplete) return;
    setState('submitting');

    const finalAnswers = getAnswers ? getAnswers(raw) : (testName === 'gad7' ? [...raw, 'N/A'] : raw);
    const local = calcScore(testName, finalAnswers);
    setResult(local);

    try {
      const res = await fetch('/api/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ test_name: testName, email, answers: finalAnswers, turnstile_token: turnstileToken })
      });
      const data = await res.json();
      setEmailSent(!!data.email_sent);
    } catch (err) {
      console.error('Submit error:', err);
    }
    setState('done');
  };

  if (state === 'done' && result) {
    const lvl = levelColors[result.level] ?? levelColors.moderate;
    return (
      <div className="space-y-6 animate-fade-in">
        <div className={`p-6 rounded-2xl border ${lvl.bg} ${lvl.border} ${lvl.text}`}>
          <p className="text-xs font-bold uppercase opacity-60">Αποτέλεσμα</p>
          <p className="font-bold text-2xl">{lvl.label}</p>
        </div>
        {renderResults(result.score_json, result.level)}
        <div className="bg-white border border-slate-200 p-8 rounded-2xl text-center shadow-sm">
          <p className="text-slate-600 mb-6">
            {emailSent ? `Τα αναλυτικά αποτελέσματα στάλθηκαν στο ${email}` : 'Τα αποτελέσματα είναι έτοιμα.'}
          </p>
          <a href="/epikoinonia/" className="inline-block bg-[#084a79] text-white px-8 py-3 rounded-xl font-bold hover:bg-[#063557] transition-all">Επικοινωνία & Ραντεβού</a>
        </div>
      </div>
    );
  }

  return (
    <div className="animate-fade-in">
      <header className="mb-12 text-center">
        <h1 className="text-3xl font-extrabold text-slate-900 mb-3">{title}</h1>
        {subtitle && <p className="text-slate-500 text-lg">{subtitle}</p>}
        {progressNote && <div className="mt-6 inline-block px-4 py-2 bg-blue-50 text-blue-700 text-sm font-medium rounded-lg border border-blue-100">{progressNote}</div>}
      </header>

      <form onSubmit={handleSubmit} className="space-y-12">
        <div className="space-y-12">
          {questions.map((q, qIdx) => {
            const options = q.options || (q.type === 'likert4' ? LIKERT_4 : q.type === 'likert5' ? LIKERT_5 : []);
            return (
              <div key={qIdx} className="space-y-4">
                <h3 className="text-lg font-bold text-slate-800 leading-tight">
                  <span className="text-slate-400 mr-2">{qIdx + 1}.</span> {q.text}
                </h3>
                <div className="flex flex-wrap gap-2 sm:flex-nowrap">
                  {options.map(opt => (
                    <button
                      type="button"
                      key={opt.label}
                      onClick={() => handleAnswer(qIdx, opt.value)}
                      className={`flex-1 p-3 text-center rounded-xl border transition-all font-medium text-xs sm:text-sm ${
                        raw[qIdx] === opt.value 
                          ? 'border-blue-600 bg-blue-50 text-blue-800 shadow-sm' 
                          : 'border-slate-200 hover:border-blue-300 hover:bg-slate-50 text-slate-600'
                      }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>
            );
          })}
        </div>

        <div className="pt-12 border-t border-slate-100">
          <div className="max-w-md mx-auto space-y-6">
            <div className="text-center">
              <h3 className="text-xl font-bold text-slate-900 mb-2">Υποβολή Αποτελεσμάτων</h3>
              <p className="text-slate-500 text-sm">Συμπληρώστε το email σας για να δείτε το αποτέλεσμα.</p>
            </div>
            
            <input 
              type="email" 
              required 
              value={email} 
              onChange={e => setEmail(e.target.value)} 
              placeholder="Το email σας" 
              className="w-full px-5 py-4 rounded-xl border border-slate-300 focus:ring-2 focus:ring-[#084a79] outline-none" 
            />
            
            <div className="flex justify-center">
              <div className="cf-turnstile" data-sitekey="0x4AAAAAAA4_S437qf6B9A_E" data-callback="onTurnstileSuccess"></div>
            </div>

            <button 
              type="submit" 
              disabled={state === 'submitting' || !isComplete}
              className="w-full py-5 bg-[#084a79] text-white rounded-xl font-bold text-lg hover:bg-[#063557] disabled:opacity-50 transition-all shadow-lg shadow-blue-900/10"
            >
              {state === 'submitting' ? 'Επεξεργασία...' : 'Δείτε τα Αποτελέσματα'}
            </button>
            
            {!isComplete && (
              <p className="text-center text-xs text-rose-600 font-bold">Απαντήστε σε όλες τις ερωτήσεις για να συνεχίσετε.</p>
            )}
          </div>
        </div>
      </form>
    </div>
  );
}
