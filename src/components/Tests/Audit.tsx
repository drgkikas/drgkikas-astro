import QuizShell from './QuizShell';

// AUDIT questions with their specific option sets
const q1Options = [
  { label: 'Καθόλου', value: 0 },
  { label: '1 φορά/μήνα ή λιγότερο', value: 1 },
  { label: '2-4 φορές/μήνα', value: 2 },
  { label: '2-3 φορές/εβδομάδα', value: 3 },
  { label: '4+ φορές/εβδομάδα', value: 4 },
];

const q2Options = [
  { label: '1-2', value: 0 },
  { label: '3-4', value: 1 },
  { label: '5-6', value: 2 },
  { label: '7-9', value: 3 },
  { label: '10+', value: 4 },
];

const q3Options = [
  { label: 'Ποτέ', value: 0 },
  { label: 'Λιγότερο από μηνιαίως', value: 1 },
  { label: 'Μηνιαίως', value: 2 },
  { label: 'Εβδομαδιαίως', value: 3 },
  { label: 'Καθημερινά ή σχεδόν', value: 4 },
];

// Q4-Q8 use same scale as Q3
const q48Options = q3Options;

// Q9-Q10: 0, 2, 4
const q910Options = [
  { label: 'Όχι', value: 0 },
  { label: 'Ναι, αλλά όχι τους τελευταίους 12 μήνες', value: 2 },
  { label: 'Ναι, τους τελευταίους 12 μήνες', value: 4 },
];

const questions = [
  { text: 'Πόσο συχνά καταναλώνετε αλκοολούχα ποτά;', type: 'select' as const, options: q1Options },
  { text: 'Πόσες μερίδες αλκοόλ πίνετε σε μια τυπική μέρα που πίνετε;', type: 'select' as const, options: q2Options },
  { text: 'Πόσο συχνά πίνετε 6 ή περισσότερα ποτά σε μία μέρα;', type: 'select' as const, options: q3Options },
  { text: 'Πόσο συχνά κατά τη διάρκεια του τελευταίου χρόνου διαπιστώσατε ότι δεν μπορούσατε να σταματήσετε να πίνετε αφού ξεκινήσατε;', type: 'select' as const, options: q48Options },
  { text: 'Πόσο συχνά κατά τη διάρκεια του τελευταίου χρόνου αποτύχατε να κάνετε αυτό που περιμένεται από εσάς εξαιτίας του πίνειν;', type: 'select' as const, options: q48Options },
  { text: 'Πόσο συχνά κατά τη διάρκεια του τελευταίου χρόνου χρειαστήκατε ένα αλκοολούχο ποτό το πρωί για να ξεκινήσετε τη μέρα σας μετά από μια βαριά νύχτα πίνειν;', type: 'select' as const, options: q48Options },
  { text: 'Πόσο συχνά κατά τη διάρκεια του τελευταίου χρόνου αισθανθήκατε ενοχές ή τύψεις για το πίνειν;', type: 'select' as const, options: q48Options },
  { text: 'Πόσο συχνά κατά τη διάρκεια του τελευταίου χρόνου αδυνατήσατε να θυμηθείτε τι συνέβη την προηγούμενη νύχτα επειδή πίνατε;', type: 'select' as const, options: q48Options },
  { text: 'Έχετε τραυματίσει τον εαυτό σας ή κάποιον άλλον επειδή πίνατε;', type: 'select' as const, options: q910Options },
  { text: 'Έχει εκφράσει κάποιος συγγενής, φίλος ή γιατρός ανησυχία για το πίνειν σας ή σας έχει προτείνει να μειώσετε;', type: 'select' as const, options: q910Options },
];

const levelLabels: Record<string, string> = {
  low: 'Χαμηλός κίνδυνος', hazardous: 'Επικίνδυνη χρήση',
  harmful: 'Επιβλαβής χρήση', dependent: 'Πιθανή εξάρτηση',
};

export default function Audit() {
  return (
    <QuizShell
      testName="audit"
      title="AUDIT"
      subtitle="Κλίμακα Αναγνώρισης Επικίνδυνης Χρήσης Αλκοόλ (WHO) — Τελευταίος χρόνος"
      questions={questions}
      getAnswers={raw => raw.map(v => (v ?? 0) as number)}
      renderResults={(s, level) => {
        const total = s.total as number;
        const q9Flag = s.q9_flag as boolean;
        const q10Flag = s.q10_flag as boolean;
        return (
          <div className="bg-white border border-slate-200 rounded-xl p-6 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-slate-600 font-medium">Συνολικό score</span>
              <span className="text-2xl font-bold text-blue-900">
                {total}<span className="text-slate-400 text-base font-normal">/40</span>
              </span>
            </div>
            <div className="flex items-center justify-between py-3 border-t border-slate-100">
              <span className="text-slate-600 font-medium">Εκτίμηση</span>
              <span className="font-semibold">{levelLabels[level] ?? level}</span>
            </div>
            {(q9Flag || q10Flag) && (
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                <p className="text-sm text-amber-700 font-medium">
                  Έχετε αναφέρει περιστατικά σχετικά με βλάβες από το αλκοόλ. Αυτό αξίζει ιδιαίτερη προσοχή.
                </p>
              </div>
            )}
          </div>
        );
      }}
    />
  );
}
