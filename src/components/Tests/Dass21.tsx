import QuizShell from './QuizShell';

const levelGr: Record<string, string> = {
  normal: 'Φυσιολογικό', mild: 'Ήπιο', moderate: 'Μέτριο', severe: 'Σοβαρό', extreme: 'Ακραίο',
};

const questions = [
  { text: 'Δυσκολεύτηκα να ηρεμήσω', type: 'likert4' as const },
  { text: 'Ένιωσα το στόμα μου να στεγνώνει', type: 'likert4' as const },
  { text: 'Δεν μπορούσα να νιώσω κανένα θετικό συναίσθημα', type: 'likert4' as const },
  { text: 'Αντιμετώπισα δυσκολία στην αναπνοή (π.χ. ταχύπνοια, λαχάνιασμα)', type: 'likert4' as const },
  { text: 'Δυσκολεύτηκα να πάρω πρωτοβουλία για δραστηριότητες', type: 'likert4' as const },
  { text: 'Έτεινα να αντιδρώ υπερβολικά σε καταστάσεις', type: 'likert4' as const },
  { text: 'Ένιωσα τρέμουλο (π.χ. στα χέρια)', type: 'likert4' as const },
  { text: 'Ένιωσα ότι ξόδευα πολλή νευρική ενέργεια', type: 'likert4' as const },
  { text: 'Ανησυχούσα για καταστάσεις όπου μπορούσα να πανικοβληθώ', type: 'likert4' as const },
  { text: 'Ένιωσα ότι δεν είχα τίποτα να περιμένω', type: 'likert4' as const },
  { text: 'Ένιωθα ταραγμένος/η', type: 'likert4' as const },
  { text: 'Δυσκολευόμουν να χαλαρώσω', type: 'likert4' as const },
  { text: 'Ένιωσα κατήφεια και μελαγχολία', type: 'likert4' as const },
  { text: 'Ήμουν ανυπόμονος/η αν κάτι με εμπόδιζε', type: 'likert4' as const },
  { text: 'Ένιωσα κοντά στον πανικό', type: 'likert4' as const },
  { text: 'Δεν μπορούσα να ενθουσιαστώ για τίποτα', type: 'likert4' as const },
  { text: 'Ένιωθα ότι δεν αξίζω ως άνθρωπος', type: 'likert4' as const },
  { text: 'Ένιωσα ότι ήμουν αρκετά ευερέθιστος/η', type: 'likert4' as const },
  { text: 'Ήμουν ευαίσθητος/η σε καρδιακούς παλμούς χωρίς σωματική άσκηση', type: 'likert4' as const },
  { text: 'Ένιωσα φόβο χωρίς εμφανή λόγο', type: 'likert4' as const },
  { text: 'Ένιωσα ότι η ζωή δεν έχει νόημα', type: 'likert4' as const },
];

function ScoreBar({ label, score, level }: { label: string; score: number; level: string }) {
  const colors: Record<string, string> = { normal:'text-emerald-600', mild:'text-amber-600', moderate:'text-amber-600', severe:'text-red-600', extreme:'text-red-700' };
  return (
    <div className="flex items-center justify-between py-3 border-b border-slate-100 last:border-0">
      <span className="font-medium text-slate-700">{label}</span>
      <span className={`font-bold ${colors[level] ?? 'text-slate-600'}`}>{score} — {levelGr[level] ?? level}</span>
    </div>
  );
}

export default function Dass21() {
  return (
    <QuizShell
      testName="dass21"
      title="DASS-21"
      subtitle="Αξιολόγηση κατάθλιψης, άγχους και stress τις τελευταίες 2 εβδομάδες"
      progressNote="Κάθε ερώτηση αφορά το πώς νιώσατε κατά την παρελθούσα εβδομάδα"
      questions={questions}
      getAnswers={raw => raw.map(v => (v ?? 0) as number)}
      renderResults={(s, level) => {
        const dLvl = s.depression_level as string;
        const aLvl = s.anxiety_level as string;
        const sLvl = s.stress_level as string;
        return (
          <div className="bg-white border border-slate-200 rounded-xl p-6 space-y-1">
            <p className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">Αποτελέσματα ανά διάσταση</p>
            <ScoreBar label="Κατάθλιψη" score={s.depression as number} level={dLvl} />
            <ScoreBar label="Άγχος" score={s.anxiety as number} level={aLvl} />
            <ScoreBar label="Stress" score={s.stress as number} level={sLvl} />
            <p className="text-xs text-slate-400 pt-3">
              Το επίπεδο που επηρεάζει περισσότερο: <strong>{levelGr[level] ?? level}</strong>
            </p>
          </div>
        );
      }}
    />
  );
}
