import { useState } from 'react';

const questions = [
  "Δυσκολεύτηκα να ηρεμήσω",
  "Ένιωσα το στόμα μου να στεγνώνει",
  "Δεν μπορούσα να νιώσω κανένα θετικό συναίσθημα",
  "Αντιμετώπισα δυσκολία στην αναπνοή χωρίς προφανή λόγο",
  "Δυσκολεύτηκα να πάρω πρωτοβουλία για να κάνω πράγματα"
];

export default function Dass21() {
  const [answers, setAnswers] = useState<number[]>(Array(questions.length).fill(-1));
  const [showResults, setShowResults] = useState(false);

  const handleAnswer = (index: number, value: number) => {
    const newAnswers = [...answers];
    newAnswers[index] = value;
    setAnswers(newAnswers);
  };

  const isComplete = answers.every(a => a !== -1);

  return (
    <div className="bg-slate-50 rounded-2xl p-8 border border-slate-200 shadow-sm">
      {!showResults ? (
        <div className="space-y-8">
          {questions.map((q, i) => (
            <div key={i} className="border-b border-slate-200 pb-6 last:border-0">
              <h3 className="font-medium text-slate-800 mb-4">{i + 1}. {q}</h3>
              <div className="flex flex-wrap gap-2 sm:gap-4">
                {[0, 1, 2, 3].map((val) => (
                  <button
                    key={val}
                    onClick={() => handleAnswer(i, val)}
                    className={`flex-1 py-2 px-4 rounded-lg border transition-all justify-center items-center flex text-sm ${
                      answers[i] === val 
                        ? 'bg-teal-600 text-white border-teal-600 font-semibold' 
                        : 'bg-white text-slate-600 border-slate-300 hover:border-teal-400'
                    }`}
                  >
                    {val === 0 && 'Ποτέ'}
                    {val === 1 && 'Μερικές Φορές'}
                    {val === 2 && 'Αρκετά Συχνά'}
                    {val === 3 && 'Σχεδόν Πάντα'}
                  </button>
                ))}
              </div>
            </div>
          ))}
          <button 
            onClick={() => setShowResults(true)}
            disabled={!isComplete}
            className={`w-full py-4 rounded-xl font-bold transition-colors ${
              isComplete 
                ? 'bg-teal-600 text-white hover:bg-teal-700 shadow-md transform hover:-translate-y-0.5 transition-all' 
                : 'bg-slate-200 text-slate-400 cursor-not-allowed'
            }`}
          >
            Εμφάνιση Αποτελεσμάτων (Zero-Data Process)
          </button>
        </div>
      ) : (
        <div className="text-center py-8 animate-fade-in">
          <div className="w-20 h-20 bg-teal-100 text-teal-600 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
          </div>
          <h3 className="text-2xl font-bold text-slate-900 mb-4">Αποτελέσματα DASS-21</h3>
          <p className="text-slate-600 mb-8 max-w-lg mx-auto">
            Βάσει των απαντήσεών σας, προτείνεται κλινική αξιολόγηση. Η αναγνώριση των συμπτωμάτων είναι το πρώτο βήμα. 
            Η εξατομικευμένη προσέγγιση με rTMS ή Ψυχοθεραπεία μπορεί να προσφέρει δραστική βελτίωση.
          </p>
          
          <div className="bg-white rounded-xl p-6 border border-teal-100 shadow-sm max-w-md mx-auto mb-8 text-left relative overflow-hidden">
             <div className="absolute top-0 left-0 w-1 h-full bg-teal-500"></div>
            <p className="text-xs font-bold uppercase tracking-wider text-teal-600 mb-2">Κοστος Θεραπειας</p>
            <p className="text-slate-800 text-sm leading-relaxed">Το θεραπευτικό πλάνο προσαρμόζεται στο δικό σας budget. <br/><br/>Η <strong>βασική μονάδα συνεδρίας είναι 70€</strong>.</p>
          </div>
          
          <a href="#contact" className="btn-primary inline-flex">Κλείστε Ραντεβού Τώρα</a>
          
          <button 
            onClick={() => { setAnswers(Array(questions.length).fill(-1)); setShowResults(false); }} 
            className="block mx-auto mt-6 text-slate-400 hover:text-slate-600 text-sm underline decoration-slate-300 underline-offset-4 transition-colors"
          >
            Επαναναληψη Τεστ (Clear Memory)
          </button>
        </div>
      )}
    </div>
  );
}
