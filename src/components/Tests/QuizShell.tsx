import { useState, useCallback } from 'react';
import { calcScore, type TestName } from '../../lib/clientScoring';

// ─── Types ────────────────────────────────────────────────────
export interface QuizQuestion {
  text: string;
  type?: 'likert4' | 'likert5' | 'yesno' | 'select';
  options?: { label: string; value: number | string }[];
}

interface Props {
  testName: TestName;
  title: string;
  subtitle: string;
  questions: QuizQuestion[];
  getAnswers: (raw: (number | string | boolean | null)[]) => unknown;
  renderResults: (scoreJson: Record<string, unknown>, level: string) => React.ReactNode;
  progressNote?: string;
}

const APPT_LINK = 'https://appt.link/meet-with-paschalis-gkikas/therapy-session';

const levelColors: Record<string, { bg: string; text: string; border: string; label: string }> = {
  normal:            { bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200', label: 'Φυσιολογικό' },
  minimal:           { bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200', label: 'Ελάχιστο' },
  low:               { bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200', label: 'Χαμηλό' },
  negative:          { bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200', label: 'Αρνητικό' },
  mild:              { bg: 'bg-amber-50',   text: 'text-amber-700',   border: 'border-amber-200',   label: 'Ήπιο' },
  moderate:          { bg: 'bg-amber-50',   text: 'text-amber-700',   border: 'border-amber-200',   label: 'Μέτριο' },
  hazardous:         { bg: 'bg-amber-50',   text: 'text-amber-700',   border: 'border-amber-200',   label: 'Επικίνδυνο' },
  moderately_severe: { bg: 'bg-orange-50',  text: 'text-orange-700',  border: 'border-orange-200',  label: 'Σημαντικό' },
  severe:            { bg: 'bg-red-50',     text: 'text-red-700',     border: 'border-red-200',     label: 'Σοβαρό' },
  extreme:           { bg: 'bg-red-50',     text: 'text-red-700',     border: 'border-red-200',     label: 'Ακραίο' },
  critical:          { bg: 'bg-red-50',     text: 'text-red-700',     border: 'border-red-200',     label: 'Κρίσιμο' },
  harmful:           { bg: 'bg-red-50',     text: 'text-red-700',     border: 'border-red-200',     label: 'Επιβλαβές' },
  dependent:         { bg: 'bg-red-50',     text: 'text-red-700',     border: 'border-red-200',     label: 'Εξάρτηση' },
  positive:          { bg: 'bg-amber-50',   text: 'text-amber-700',   border: 'border-amber-200',   label: 'Θετικό' },
};

function CtaBlock({ level }: { level: string }) {
  const safe = ['normal', 'minimal', 'low', 'negative'];
  const mid  = ['mild', 'moderate', 'hazardous'];
  if (safe.includes(level)) return (
    <a href="https://drgkikas.com/epikoinonia"
      className="inline-flex items-center gap-2 mt-4 text-blue-700 font-semibold hover:underline text-sm">
      Επικοινωνήστε μαζί μου →
    </a>
  );
  if (mid.includes(level)) return (
    <a href={APPT_LINK} target="_blank" rel="noopener noreferrer"
      className="inline-flex items-center gap-2 mt-4 bg-blue-700 text-white px-6 py-3 rounded-xl font-semibold text-sm hover:bg-blue-800 transition-colors">
      Κλείστε Ραντεβού →
    </a>
  );
  return (
    <div className="mt-4 space-y-3">
      <a href={APPT_LINK} target="_blank" rel="noopener noreferrer"
        className="inline-flex items-center gap-2 bg-red-600 text-white px-6 py-3 rounded-xl font-semibold text-sm hover:bg-red-700 transition-colors">
        Κλείστε Ραντεβού →
      </a>
      <p className="text-sm text-slate-500">Ή καλέστε τη γραμμή <strong>10306</strong> (24ωρη, δωρεάν)</p>
    </div>
  );
}

export default function QuizShell({ testName, title, subtitle, questions, getAnswers, renderResults, progressNote }: Props) {
  const [raw, setRaw] = useState<(number | string | boolean | null)[]>(Array(questions.length).fill(null));
  const [email, setEmail] = useState('');
  const [state, setState] = useState<'quiz' | 'submitting' | 'done' | 'error'>('quiz');
  const [result, setResult] = useState<{ level: string; score_json: Record<string, unknown> } | null>(null);
  const [emailSent, setEmailSent] = useState(false);

  const answered = raw.filter(v => v !== null).length;
  const total = questions.length;
  const progress = Math.round((answered / total) * 100);
  const isComplete = answered === total;

  const setAnswer = useCallback((i: number, val: number | string | boolean) => {
    setRaw(prev => { const n = [...prev]; n[i] = val; return n; });
  }, []);

  const handleSubmit = async () => {
    if (!isComplete || !email) return;
    setState('submitting');

    const answers = getAnswers(raw);

    // Instant local score
    const localResult = calcScore(testName, answers);
    setResult(localResult);
    setState('done');

    // Async API call
    try {
      const res = await fetch('/api/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ test_name: testName, email, answers }),
      });
      const data = await res.json() as { email_sent?: boolean };
      setEmailSent(data.email_sent ?? false);
    } catch {
      // Silent — user already has results
    }
  };

  if (state === 'done' && result) {
    const lvl = levelColors[result.level] ?? levelColors.moderate;
    return (
      <div className="space-y-6 animate-fade-in">
        {/* Level badge */}
        <div className={`flex items-center gap-3 p-4 rounded-xl border ${lvl.bg} ${lvl.border}`}>
          <div className="w-3 h-3 rounded-full bg-current opacity-60" style={{color: 'inherit'}} />
          <div>
            <p className="text-xs font-bold uppercase tracking-wider opacity-60">Επίπεδο</p>
            <p className={`font-bold text-lg ${lvl.text}`}>{lvl.label}</p>
          </div>
        </div>

        {/* Test-specific results */}
        {renderResults(result.score_json, result.level)}

        {/* CTA */}
        <div className="bg-white border border-slate-200 rounded-xl p-6">
          <p className="font-semibold text-slate-800 mb-1">Επόμενο βήμα</p>
          <p className="text-sm text-slate-500 mb-2">
            {emailSent
              ? `Τα αποτελέσματά σας στάλθηκαν στο ${email}.`
              : 'Τα αποτελέσματά σας επεξεργάζονται...'}
          </p>
          <CtaBlock level={result.level} />
        </div>

        <button
          onClick={() => { setRaw(Array(questions.length).fill(null)); setEmail(''); setState('quiz'); setResult(null); }}
          className="text-sm text-slate-400 hover:text-slate-600 underline underline-offset-4 transition-colors"
        >
          Επανάληψη ερωτηματολογίου
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-blue-900">{title}</h2>
        <p className="text-slate-600 mt-1 text-sm">{subtitle}</p>
        {progressNote && <p className="text-xs text-slate-400 mt-1">{progressNote}</p>}
      </div>

      {/* Progress bar */}
      <div>
        <div className="flex justify-between text-xs text-slate-400 mb-1">
          <span>{answered} από {total} ερωτήσεις</span>
          <span>{progress}%</span>
        </div>
        <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
          <div
            className="h-full bg-blue-600 rounded-full transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* Questions */}
      <div className="space-y-6">
        {questions.map((q, i) => {
          const opts = q.options ?? defaultOptions(q.type ?? 'likert4');
          const cur = raw[i];
          return (
            <div key={i} className={`p-5 rounded-xl border transition-all ${cur !== null ? 'border-blue-200 bg-blue-50/30' : 'border-slate-200 bg-white'}`}>
              <p className="font-medium text-slate-800 mb-4 leading-relaxed">
                <span className="text-blue-600 font-bold mr-2">{i + 1}.</span>
                {q.text}
              </p>
              <div className={`flex ${opts.length <= 2 ? 'gap-3' : 'flex-wrap gap-2'}`}>
                {opts.map((opt, j) => (
                  <button
                    key={j}
                    onClick={() => setAnswer(i, opt.value as number | string | boolean)}
                    className={`flex-1 min-w-[80px] py-2.5 px-3 rounded-lg border text-sm font-medium transition-all text-center ${
                      cur === opt.value
                        ? 'bg-blue-700 text-white border-blue-700 shadow-sm'
                        : 'bg-white text-slate-600 border-slate-200 hover:border-blue-400 hover:text-blue-700'
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

      {/* Email + Submit */}
      <div className="bg-slate-50 border border-slate-200 rounded-xl p-6 space-y-4">
        <div>
          <label htmlFor="quiz-email" className="block text-sm font-semibold text-slate-700 mb-2">
            Email για αποστολή αποτελεσμάτων
          </label>
          <input
            id="quiz-email"
            type="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            placeholder="your@email.com"
            className="w-full px-4 py-3 rounded-lg border border-slate-200 bg-white text-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          <p className="text-xs text-slate-400 mt-1.5">Χρησιμοποιείται μόνο για την αποστολή αποτελεσμάτων.</p>
        </div>

        <button
          onClick={handleSubmit}
          disabled={!isComplete || !email || state === 'submitting'}
          className={`w-full py-4 rounded-xl font-bold text-base transition-all ${
            isComplete && email && state !== 'submitting'
              ? 'bg-blue-700 text-white hover:bg-blue-800 shadow-md hover:-translate-y-0.5 transform'
              : 'bg-slate-200 text-slate-400 cursor-not-allowed'
          }`}
        >
          {state === 'submitting' ? 'Επεξεργασία...' : 'Δες τα αποτελέσματά σου'}
        </button>

        {!isComplete && (
          <p className="text-xs text-slate-400 text-center">
            Απάντησε όλες τις ερωτήσεις για να συνεχίσεις ({total - answered} εναπομένουν)
          </p>
        )}
      </div>

      <p className="text-xs text-slate-400 text-center">
        Τα αποτελέσματα δεν αποτελούν διάγνωση και δεν υποκαθιστούν την κλινική αξιολόγηση.
      </p>
    </div>
  );
}

function defaultOptions(type: string) {
  if (type === 'likert4') return [
    { label: 'Ποτέ', value: 0 },
    { label: 'Μερικές φορές', value: 1 },
    { label: 'Αρκετά συχνά', value: 2 },
    { label: 'Σχεδόν πάντα', value: 3 },
  ];
  if (type === 'likert5') return [
    { label: 'Καθόλου', value: 0 },
    { label: 'Λίγο', value: 1 },
    { label: 'Μέτρια', value: 2 },
    { label: 'Αρκετά', value: 3 },
    { label: 'Πάρα πολύ', value: 4 },
  ];
  if (type === 'yesno') return [
    { label: 'Ναι', value: 1 },
    { label: 'Όχι', value: 0 },
  ];
  return [];
}
