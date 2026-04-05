import QuizShell from './QuizShell';

const gad7Options = [
  { label: 'Καθόλου', value: 0 },
  { label: 'Μερικές μέρες', value: 1 },
  { label: 'Πάνω από τις μισές μέρες', value: 2 },
  { label: 'Σχεδόν κάθε μέρα', value: 3 },
];

const functionalOptions = [
  { label: 'Καθόλου', value: 'not_at_all' },
  { label: 'Κάπως', value: 'somewhat' },
  { label: 'Πολύ', value: 'very' },
  { label: 'Εξαιρετικά', value: 'extremely' },
];

const mainQuestions = [
  'Αισθάνεστε νευρικός/ή, ανήσυχος/η ή σε υπερένταση',
  'Δεν μπορείτε να σταματήσετε ή να ελέγξετε την ανησυχία σας',
  'Ανησυχείτε υπερβολικά για διάφορα πράγματα',
  'Δυσκολεύεστε να χαλαρώσετε',
  'Είστε τόσο ανήσυχος/η που δυσκολεύεστε να ηρεμήσετε',
  'Ενοχλείστε ή ερεθίζεστε εύκολα',
  'Φοβάστε ότι κάτι άσχημο μπορεί να συμβεί',
];

const levelLabels: Record<string, string> = {
  minimal: 'Ελάχιστο', mild: 'Ήπιο', moderate: 'Μέτριο', severe: 'Σοβαρό',
};

export default function Gad7() {
  return (
    <QuizShell
      testName="gad7"
      title="GAD-7"
      subtitle="Πόσο συχνά σας ενόχλησαν τα παρακάτω κατά τις τελευταίες 2 εβδομάδες;"
      questions={[
        ...mainQuestions.map(text => ({ text, type: 'select' as const, options: gad7Options })),
        {
          text: 'Αν σημείωσατε κάποιο από τα παραπάνω προβλήματα, πόσο δύσκολα σας έκαναν την εργασία, τη φροντίδα του σπιτιού ή τις σχέσεις με άλλους;',
          type: 'select' as const,
          options: functionalOptions,
        },
      ]}
      getAnswers={raw => raw}
      renderResults={(s, level) => (
        <div className="bg-white border border-slate-200 rounded-xl p-6 space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-slate-600 font-medium">Συνολικό score</span>
            <span className="text-2xl font-bold text-blue-900">{s.total as number}<span className="text-slate-400 text-base font-normal">/21</span></span>
          </div>
          <div className="flex items-center justify-between py-3 border-t border-slate-100">
            <span className="text-slate-600 font-medium">Επίπεδο άγχους</span>
            <span className="font-semibold text-slate-800">{levelLabels[level] ?? level}</span>
          </div>
        </div>
      )}
    />
  );
}
