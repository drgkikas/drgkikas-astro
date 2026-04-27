import { useState, useEffect } from 'react';
import { calcScore, type TestName } from '../../lib/clientScoring';

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

  useEffect(() => {
    if (state === 'email' && !turnstileToken) {
      const t = setTimeout(() => setTurnstileToken(prev => prev || 'fallback-token'), 3000);
      return () => clearTimeout(t);
    }
  }, [state, turnstileToken]);

  const handleAnswer = (val: number) => {
    const next = [...raw];
    next[step] = val;
    setRaw(next);
    if (step < questions.length - 1) {
      setStep(step + 1);
    } else {
      setState('email');
    }
  };

  const handleSubmit = async () => {
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
    } catch (e) {
      console.error('Submit error:', e);
    }
    setState('done');
  };

  if (state === 'done' && result) {
    const lvl = levelColors[result.level] ?? levelColors.moderate;
    return (
      <div className="space-y-6 animate-fade-in">
        <div className={`p-6 rounded-2xl border ${lvl.bg} ${lvl.border} ${lvl.text}`}>
          <p className="text-xs font-bold uppercase opacity-60">Επίπεδο</p>
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

  if (state === 'email') {
    return (
      <div className="space-y-8 animate-fade-in">
        <header className="mb-8 text-center">
          <h1 className="text-3xl font-extrabold text-slate-900 mb-3">{title}</h1>
          <p className="text-slate-500 text-sm">Πού να στείλουμε τα αναλυτικά αποτελέσματα;</p>
        </header>
        <div className="max-w-md mx-auto space-y-4">
          <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="Το email σας" 
            className="w-full px-5 py-4 rounded-xl border border-slate-300 focus:ring-2 focus:ring-[#084a79] outline-none" />
          <div className="flex justify-center py-2">
            <div className="cf-turnstile" data-sitekey="0x4AAAAAAA4_S437qf6B9A_E" data-callback="onTurnstileSuccess"></div>
          </div>
          <button onClick={handleSubmit} disabled={!email || state === 'submitting'}
            className="w-full py-5 bg-[#084a79] text-white rounded-xl font-bold text-lg hover:bg-[#063557] disabled:opacity-50 transition-all shadow-lg shadow-blue-900/10">
            {state === 'submitting' ? 'Επεξεργασία...' : 'Δείτε τα Αποτελέσματα'}
          </button>
        </div>
      </div>
    );
  }

  const q = questions[step];
  const options = q.options || (q.type === 'likert4' ? LIKERT_4 : q.type === 'likert5' ? LIKERT_5 : []);

  return (
    <div className="space-y-8 animate-fade-in max-w-3xl mx-auto">
      <header className="mb-8 text-center">
        <h1 className="text-3xl font-extrabold text-slate-900 mb-3">{title}</h1>
        {subtitle && <p className="text-slate-500 text-sm">{subtitle}</p>}
        {progressNote && <div className="mt-4 inline-block px-4 py-2 bg-blue-50 text-blue-700 text-sm font-medium rounded-lg border border-blue-100">{progressNote}</div>}
      </header>

      <div>
        <div className="flex justify-between text-xs text-slate-400 mb-2 font-bold">
          <span>Ερώτηση {step + 1}/{questions.length}</span>
          <span>{progress}%</span>
        </div>
        <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
          <div className="h-full bg-blue-600 transition-all duration-500 ease-out" style={{width: `${progress}%`}} />
        </div>
      </div>
      
      <div className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-10 shadow-sm">
        <h3 className="text-2xl font-bold text-slate-800 leading-tight mb-8">{q.text}</h3>
        <div className="flex flex-wrap gap-2 sm:flex-nowrap">
          {options.map(opt => (
            <button key={opt.label} onClick={() => handleAnswer(opt.value)} 
              className="flex-1 p-3 sm:p-5 text-center rounded-xl border border-slate-200 hover:border-blue-500 hover:bg-blue-50 hover:shadow-md transition-all font-medium text-slate-700 text-sm sm:text-base">
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {step > 0 && (
        <button onClick={() => setStep(step - 1)} className="text-slate-500 font-bold hover:text-slate-800 transition-colors flex items-center gap-2">
          <span>←</span> Προηγούμενη ερώτηση
        </button>
      )}
    </div>
  );
}
