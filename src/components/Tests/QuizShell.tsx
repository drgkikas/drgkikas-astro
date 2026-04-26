import { useState, useEffect } from 'react';
import { calcScore, type TestName } from '../../lib/clientScoring';

// ─── Types ────────────────────────────────────────────────────
export interface QuizQuestion {
  text: string;
  options: { label: string; value: number }[];
}

interface Props {
  testName: TestName;
  questions: QuizQuestion[];
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

export default function QuizShell({ testName, questions, renderResults }: Props) {
  const [step, setStep] = useState(0);
  const [raw, setRaw] = useState<(number | null)[]>(new Array(questions.length).fill(null));
  const [email, setEmail] = useState('');
  const [state, setState] = useState<'quiz' | 'email' | 'submitting' | 'done'>('quiz');
  const [result, setResult] = useState<any>(null);
  const [emailSent, setEmailSent] = useState(false);
  const [turnstileToken, setTurnstileToken] = useState<string | null>(null);

  const isComplete = raw.every(v => v !== null);
  const progress = Math.round(((raw.filter(v => v !== null).length) / questions.length) * 100);

  useEffect(() => {
    const handleTurnstile = (e: any) => setTurnstileToken(e.detail.token);
    window.addEventListener('turnstile-success', handleTurnstile);
    return () => window.removeEventListener('turnstile-success', handleTurnstile);
  }, []);

  // Simple fallback: unlock button after 2s if no token
  useEffect(() => {
    if (state === 'email' && !turnstileToken) {
      const t = setTimeout(() => setTurnstileToken(prev => prev || 'fallback-token'), 2000);
      return () => clearTimeout(t);
    }
  }, [state, turnstileToken]);

  const handleAnswer = (val: number) => {
    const next = [...raw];
    next[step] = val;
    setRaw(next);
    if (step < questions.length - 1) setStep(step + 1);
    else setState('email');
  };

  const handleSubmit = async () => {
    if (!email || !isComplete) return;
    setState('submitting');

    const answers = testName === 'gad7' ? [...raw, 'N/A'] : raw;
    const local = calcScore(testName, answers);
    setResult(local);

    try {
      const res = await fetch('/api/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ test_name: testName, email, answers, turnstile_token: turnstileToken })
      });
      const data = await res.json();
      setEmailSent(!!data.email_sent);
    } catch (e) {
      console.error('Submit error:', e);
    }
    setState('done');
  };

  if (state === 'done' && result) {
    const lvl = levelColors[result.level] ?? levelColors.moderate;
    return (
      <div className="space-y-6 animate-fade-in">
        <div className={`p-4 rounded-xl border ${lvl.bg} ${lvl.border} ${lvl.text}`}>
          <p className="text-xs font-bold uppercase opacity-60">Επίπεδο</p>
          <p className="font-bold text-lg">{lvl.label}</p>
        </div>
        {renderResults(result.score_json, result.level)}
        <div className="bg-white border p-6 rounded-xl text-center">
          <p className="text-sm text-slate-500 mb-4">
            {emailSent ? `Τα αποτελέσματα στάλθηκαν στο ${email}` : 'Τα αποτελέσματα είναι έτοιμα (το email καθυστερεί).'}
          </p>
          <a href="https://drgkikas.com/epikoinonia" className="text-blue-600 font-bold">Επικοινωνία →</a>
        </div>
      </div>
    );
  }

  if (state === 'email') {
    return (
      <div className="space-y-6 animate-fade-in">
        <div className="text-center">
          <h3 className="text-xl font-bold text-blue-900">Τελευταίο βήμα</h3>
          <p className="text-slate-500 text-sm">Πού να στείλουμε τα αναλυτικά αποτελέσματα;</p>
        </div>
        <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="Το email σας" 
          className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 outline-none" />
        <div id="turnstile-container" className="flex justify-center">
          <div className="cf-turnstile" data-sitekey="0x4AAAAAAA4_S437qf6B9A_E" data-callback="onTurnstileSuccess"></div>
        </div>
        <button onClick={handleSubmit} disabled={!email || state === 'submitting'}
          className="w-full py-4 bg-blue-700 text-white rounded-xl font-bold hover:bg-blue-800 disabled:opacity-50 transition-all">
          {state === 'submitting' ? 'Αποστολή...' : 'Δες τα αποτελέσματα →'}
        </button>
      </div>
    );
  }

  const q = questions[step];
  return (
    <div className="space-y-8 animate-fade-in">
      <div>
        <div className="flex justify-between text-xs text-slate-400 mb-2"><span>Ερώτηση {step + 1}/{questions.length}</span><span>{progress}%</span></div>
        <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden"><div className="h-full bg-blue-600 transition-all" style={{width: `${progress}%`}} /></div>
      </div>
      <h3 className="text-xl font-bold text-slate-800 leading-tight">{q.text}</h3>
      <div className="grid gap-3">
        {q.options.map(opt => (
          <button key={opt.label} onClick={() => handleAnswer(opt.value)} 
            className="w-full p-4 text-left rounded-xl border border-slate-200 hover:border-blue-500 hover:bg-blue-50 transition-all font-medium text-slate-700">
            {opt.label}
          </button>
        ))}
      </div>
      {step > 0 && <button onClick={() => setStep(step - 1)} className="text-slate-400 text-sm hover:text-slate-600">← Πίσω</button>}
    </div>
  );
}
