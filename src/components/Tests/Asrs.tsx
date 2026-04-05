import QuizShell from './QuizShell';

// ASRS Frequency scale: 0=Never, 1=Rarely, 2=Sometimes, 3=Often, 4=Very Often
const asrsOptions = [
  { label: 'Ποτέ', value: 0 },
  { label: 'Σπάνια', value: 1 },
  { label: 'Μερικές φορές', value: 2 },
  { label: 'Συχνά', value: 3 },
  { label: 'Πολύ συχνά', value: 4 },
];

const questions = [
  // Part A (Q1-6) — determines screening result
  'Πόσο συχνά κάνετε λάθη που δεν προσέχετε ή παραλείπετε λεπτομέρειες στο εργασιακό σας χώρο ή σε άλλες δραστηριότητες;',
  'Πόσο συχνά δυσκολεύεστε να συγκεντρωθείτε σε αυτό που κάνετε;',
  'Πόσο συχνά δυσκολεύεστε να παραμείνετε συγκεντρωμένοι όταν κάποιος σας μιλάει απευθείας;',
  'Πόσο συχνά αφήνετε μια εργασία στη μέση ή δυσκολεύεστε να την τελειώσετε μόλις ξεπεράσετε τα δύσκολα σημεία;',
  'Πόσο συχνά δυσκολεύεστε να οργανώσετε δραστηριότητες που πρέπει να γίνουν σε ακολουθία;',
  'Πόσο συχνά αναβάλετε ή αποφεύγετε να ξεκινήσετε εργασίες που απαιτούν πολλή σκέψη;',
  // Part B (Q7-18) — stored but doesn't determine screening
  'Πόσο συχνά χάνετε αντικείμενα που χρειάζεστε για δραστηριότητές σας (π.χ. μολύβι, κλειδιά, χαρτιά, γυαλιά, κινητό);',
  'Πόσο συχνά αποσπάστε την προσοχή από εξωτερικά ερεθίσματα;',
  'Πόσο συχνά δυσκολεύεστε να θυμηθείτε καθημερινές υποχρεώσεις;',
  'Πόσο συχνά σουπάτε ή τρώτε τα νύχια σας ή κάνετε άλλες κινήσεις του σώματος;',
  'Πόσο συχνά αισθάνεστε ότι «φουσκώνετε» από μέσα ή ότι χρειάζεται να κινηθείτε;',
  'Πόσο συχνά φεύγετε από την καρέκλα σε περιπτώσεις που πρέπει να ηρεμείτε;',
  'Πόσο συχνά νιώθετε ανήσυχος/η ή εκνευρισμένος/η;',
  'Πόσο συχνά δυσκολεύεστε να χαλαρώσετε ή να ξεκουραστείτε όταν έχετε ελεύθερο χρόνο;',
  'Πόσο συχνά μιλάτε υπερβολικά σε κοινωνικές καταστάσεις;',
  'Πόσο συχνά συμπληρώνετε τις προτάσεις των άλλων και «σκαλώνετε» αναμένοντας τη σειρά σας;',
  'Πόσο συχνά δυσκολεύεστε σε καταστάσεις που απαιτούν να περιμένετε τη σειρά σας;',
  'Πόσο συχνά διακόπτετε τους άλλους όταν είναι απασχολημένοι;',
];

export default function Asrs() {
  return (
    <QuizShell
      testName="asrs"
      title="ASRS-v1.1"
      subtitle="Κλίμακα Αυτοαναφοράς ADHD ενηλίκων (WHO) — Πόσο συχνά τους τελευταίους 6 μήνες;"
      progressNote="Οι πρώτες 6 ερωτήσεις καθορίζουν το αποτέλεσμα. Οι υπόλοιπες παρέχουν επιπλέον πληροφορία."
      questions={questions.map(text => ({ text, type: 'select' as const, options: asrsOptions }))}
      getAnswers={raw => raw.map(v => (v ?? 0) as number)}
      renderResults={(s, level) => {
        const isPositive = level === 'positive';
        const partAPositive = s.part_a_positive as number;
        const subtype = s.subtype as string;
        const subtypeGr: Record<string, string> = {
          inattentive: 'Κυρίως απροσεξία',
          hyperactive: 'Κυρίως υπερκινητικότητα',
          mixed: 'Μεικτός τύπος',
        };
        return (
          <div className="bg-white border border-slate-200 rounded-xl p-6 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-slate-600 font-medium">Αποτέλεσμα</span>
              <span className={`font-bold ${isPositive ? 'text-amber-600' : 'text-emerald-600'}`}>
                {isPositive ? 'Θετικό' : 'Αρνητικό'}
              </span>
            </div>
            <div className="flex items-center justify-between py-3 border-t border-slate-100">
              <span className="text-slate-600 text-sm">Θετικές απαντήσεις (Μέρος Α)</span>
              <span className="font-semibold">{partAPositive}/6</span>
            </div>
            {isPositive && (
              <div className="flex items-center justify-between py-3 border-t border-slate-100">
                <span className="text-slate-600 text-sm">Υποτύπος</span>
                <span className="font-semibold text-sm">{subtypeGr[subtype] ?? subtype}</span>
              </div>
            )}
          </div>
        );
      }}
    />
  );
}
