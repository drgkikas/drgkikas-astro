import QuizShell from './QuizShell';

const phq9Options = [
  { label: 'Καθόλου', value: 0 },
  { label: 'Μερικές μέρες', value: 1 },
  { label: 'Πάνω από τις μισές μέρες', value: 2 },
  { label: 'Σχεδόν κάθε μέρα', value: 3 },
];

const questions = [
  'Λίγο ενδιαφέρον ή ευχαρίστηση από πράγματα που κάνετε',
  'Αίσθηση κατήφειας, μελαγχολίας ή απελπισίας',
  'Δυσκολία να κοιμηθείτε ή να παραμείνετε στον ύπνο, ή αντίθετα, υπερβολική υπνηλία',
  'Αίσθηση κούρασης ή έλλειψης ενέργειας',
  'Κακή όρεξη ή υπερφαγία',
  'Άσχημη αίσθηση για τον εαυτό σας — ότι είστε αποτυχημένος/η, ή ότι έχετε απογοητεύσει τον εαυτό σας ή την οικογένειά σας',
  'Δυσκολία συγκέντρωσης σε πράγματα όπως ανάγνωση εφημερίδας ή παρακολούθηση τηλεόρασης',
  'Να κινείστε ή να μιλάτε τόσο αργά ώστε να το παρατηρούν οι άλλοι — ή, αντίθετα, να είστε τόσο ανήσυχος/η που κινείστε πολύ περισσότερο από το συνηθισμένο',
  'Σκέψεις ότι θα ήταν καλύτερα να ήσαστε νεκρός/ή, ή ότι θέλετε να βλάψετε τον εαυτό σας με τον ένα ή τον άλλο τρόπο',
];

const levelLabels: Record<string, string> = {
  minimal: 'Ελάχιστη / Καμία', mild: 'Ήπια', moderate: 'Μέτρια',
  moderately_severe: 'Μέτρια προς Σοβαρή', severe: 'Σοβαρή', critical: 'Απαιτεί άμεση προσοχή',
};

export default function Phq9() {
  return (
    <QuizShell
      testName="phq9"
      title="PHQ-9"
      subtitle="Πόσο συχνά σας ενόχλησαν τα παρακάτω κατά τις τελευταίες 2 εβδομάδες;"
      questions={questions.map(text => ({
        text,
        type: 'select' as const,
        options: phq9Options,
      }))}
      getAnswers={raw => raw.map(v => (v ?? 0) as number)}
      renderResults={(s, level) => {
        const q9Flag = s.q9_flag as boolean;
        const total = s.total as number;
        return (
          <div className="bg-white border border-slate-200 rounded-xl p-6 space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-slate-600 font-medium">Συνολικό score</span>
              <span className="text-2xl font-bold text-blue-900">{total}<span className="text-slate-400 text-base font-normal">/27</span></span>
            </div>
            <div className="flex items-center justify-between py-3 border-t border-slate-100">
              <span className="text-slate-600 font-medium">Κατάθλιψη</span>
              <span className="font-semibold text-slate-800">{levelLabels[level] ?? level}</span>
            </div>
            {q9Flag && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <p className="text-sm text-red-700 font-medium">
                  Έχετε αναφέρει σκέψεις αυτοτραυματισμού. Αν χρειάζεστε υποστήριξη άμεσα, καλέστε τη <strong>γραμμή 10306</strong> (24ωρη, δωρεάν).
                </p>
              </div>
            )}
          </div>
        );
      }}
    />
  );
}
