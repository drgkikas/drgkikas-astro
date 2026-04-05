import QuizShell from './QuizShell';

const levelLabels: Record<string, string> = {
  minimal: 'Ελάχιστο / Καμία ένδειξη',
  moderate: 'Μέτριο',
  severe: 'Σοβαρό',
};

const questions = [
  // Cluster B – Intrusion (Q1–5)
  { text: 'Αναπαραστάσεις, αναμνήσεις ή σκέψεις που σχετίζονται με την τραυματική εμπειρία και επέστρεφαν ξανά και ξανά ανεπιθύμητα', type: 'likert5' as const },
  { text: 'Ενοχλητικά όνειρα που σχετίζονταν με την τραυματική εμπειρία', type: 'likert5' as const },
  { text: 'Αίσθηση ή συμπεριφορά σαν η τραυματική εμπειρία να ξαναγίνεται (σαν να ζούσες ξανά το γεγονός)', type: 'likert5' as const },
  { text: 'Έντονη αναστάτωση όταν κάτι σε θύμιζε την τραυματική εμπειρία', type: 'likert5' as const },
  { text: 'Έντονες σωματικές αντιδράσεις (π.χ. εφίδρωση, γρήγοροι παλμοί) όταν κάτι σε θύμιζε την τραυματική εμπειρία', type: 'likert5' as const },
  // Cluster C – Avoidance (Q6–7)
  { text: 'Αποφυγή εσωτερικών σκέψεων ή συναισθημάτων που σχετίζονται με την τραυματική εμπειρία', type: 'likert5' as const },
  { text: 'Αποφυγή εξωτερικών υπενθυμίσεων (ανθρώπων, μέρων, αντικειμένων, συνομιλιών, δραστηριοτήτων)', type: 'likert5' as const },
  // Cluster D – Negative alterations (Q8–14)
  { text: 'Δυσκολία στο να θυμάσαι σημαντικές πτυχές της τραυματικής εμπειρίας', type: 'likert5' as const },
  { text: 'Πολύ αρνητικές πεποιθήσεις για τον εαυτό σου, για άλλους ή για τον κόσμο (π.χ. «Είμαι κακός», «Κανείς δεν είναι αξιόπιστος»)', type: 'likert5' as const },
  { text: 'Αδικαιολόγητο αίσθημα ενοχής ή κατηγορία του εαυτού σου ή των άλλων για την τραυματική εμπειρία', type: 'likert5' as const },
  { text: 'Πολύ αρνητικά συναισθήματα (π.χ. φόβος, τρόμος, θυμός, ενοχή ή ντροπή)', type: 'likert5' as const },
  { text: 'Απώλεια ενδιαφέροντος για δραστηριότητες που απολάμβανες', type: 'likert5' as const },
  { text: 'Αίσθημα αποξένωσης ή ότι δεν ανήκεις στους γύρω σου', type: 'likert5' as const },
  { text: 'Αδυναμία να νιώσεις θετικά συναισθήματα (π.χ. ευτυχία, αγάπη)', type: 'likert5' as const },
  // Cluster E – Hyperarousal (Q15–20)
  { text: 'Ευερεθιστότητα, εκρήξεις θυμού ή επιθετική συμπεριφορά', type: 'likert5' as const },
  { text: 'Παρορμητική ή αυτοκαταστροφική συμπεριφορά', type: 'likert5' as const },
  { text: 'Υπερεγρήγορση — αίσθηση ότι πρέπει να είσαι συνεχώς σε επιφυλακή', type: 'likert5' as const },
  { text: 'Έντονο τίναγμα ή αντίδραση από τον ήχο ή την κίνηση', type: 'likert5' as const },
  { text: 'Δυσκολία συγκέντρωσης', type: 'likert5' as const },
  { text: 'Διαταραχές ύπνου (π.χ. δυσκολία να κοιμηθείς ή υπνηλία)', type: 'likert5' as const },
];

export default function Pcl5() {
  return (
    <QuizShell
      testName="pcl5"
      title="PCL-5"
      subtitle="Οι παρακάτω ερωτήσεις αφορούν αντιδράσεις σε έντονα αγχωτικές εμπειρίες. Σκεφτείτε συγκεκριμένα γεγονότα στη ζωή σας."
      progressNote="Πόσο σας ενόχλησαν τα παρακάτω κατά τον τελευταίο μήνα; (0=Καθόλου — 4=Πάρα πολύ)"
      questions={questions}
      getAnswers={raw => raw.map(v => (v ?? 0) as number)}
      renderResults={(s, level) => {
        const total = s.total as number;
        const clB = s.cluster_b as number;
        const clC = s.cluster_c as number;
        const clD = s.cluster_d as number;
        const clE = s.cluster_e as number;
        const dsm5 = s.dsm5_provisional as boolean;
        return (
          <div className="bg-white border border-slate-200 rounded-xl p-6 space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-slate-600 font-medium">Συνολικό score</span>
              <span className="text-2xl font-bold text-blue-900">{total}<span className="text-slate-400 text-base font-normal">/80</span></span>
            </div>
            <div className="flex items-center justify-between py-3 border-t border-slate-100">
              <span className="text-slate-600 font-medium">Επίπεδο</span>
              <span className="font-semibold text-slate-800">{levelLabels[level] ?? level}</span>
            </div>
            <div className="grid grid-cols-2 gap-3 pt-1">
              {[
                { label: 'Επανεμφάνιση (B)', val: clB, max: 20 },
                { label: 'Αποφυγή (C)', val: clC, max: 8 },
                { label: 'Αρν. αλλαγές (D)', val: clD, max: 28 },
                { label: 'Υπερεγρήγορση (E)', val: clE, max: 24 },
              ].map(({ label, val, max }) => (
                <div key={label} className="bg-slate-50 rounded-lg p-3">
                  <p className="text-xs text-slate-500 font-medium">{label}</p>
                  <p className="font-bold text-slate-800">{val}<span className="text-slate-400 text-xs font-normal">/{max}</span></p>
                </div>
              ))}
            </div>
            {dsm5 && (
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                <p className="text-sm text-amber-700 font-medium">
                  Τα αποτελέσματα πληρούν τα τεχνικά κριτήρια για provisional PTSD diagnosis (DSM-5). Αυτό δεν αποτελεί κλινική διάγνωση.
                </p>
              </div>
            )}
          </div>
        );
      }}
    />
  );
}
