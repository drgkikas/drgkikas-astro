const fs = require('fs');

// File 1: iatros.astro
let iatros = fs.readFileSync('src/pages/iatros.astro', 'utf8');

// Replace badge
iatros = iatros.replace(
  '<div class="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-900/50 border border-blue-800 text-blue-300 text-xs font-semibold uppercase tracking-widest mb-4">\r\n            Ιατρικός Διευθυντής Smart CNS Center\r\n          </div>',
  ''
).replace(
  '<div class="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-900/50 border border-blue-800 text-blue-300 text-xs font-semibold uppercase tracking-widest mb-4">\n            Ιατρικός Διευθυντής Smart CNS Center\n          </div>',
  ''
);

// Replace Hero text
const oldHeroText1 = '<p class="text-xl md:text-2xl text-slate-300 font-light mb-8 max-w-2xl">\r\n            Ψυχίατρος – Ψυχοθεραπευτής με εξειδίκευση στη Νευροτροποποίηση (rTMS/tDCS) και τη Φαρμακογονιδιωματική Αξιολόγηση.\r\n          </p>';
const oldHeroText2 = '<p class="text-xl md:text-2xl text-slate-300 font-light mb-8 max-w-2xl">\n            Ψυχίατρος – Ψυχοθεραπευτής με εξειδίκευση στη Νευροτροποποίηση (rTMS/tDCS) και τη Φαρμακογονιδιωματική Αξιολόγηση.\n          </p>';
const newHeroText = `<h2 class="text-xl md:text-2xl text-blue-300 font-medium mb-1">
            Ψυχίατρος – Ψυχοθεραπευτής
          </h2>
          <p class="text-lg text-slate-300 font-light mb-1">
            <span class="font-semibold text-white">Smart CNS Center</span>, Αθήνα
          </p>
          <p class="text-xs text-slate-400 font-bold tracking-widest uppercase mb-8 mt-4 border-l-2 border-blue-500 pl-3">
            Εξειδίκευση: rTMS / tDCS / PGx
          </p>`;
iatros = iatros.replace(oldHeroText1, newHeroText).replace(oldHeroText2, newHeroText);

// Replace CTA
const oldCTA1 = '<div class="flex flex-wrap justify-center md:justify-start gap-4">\r\n            <a href="#cv" class="btn-primary bg-blue-600 hover:bg-blue-500 text-white px-6 py-3 rounded-lg font-medium transition-colors">Πλήρες Βιογραφικό</a>\r\n            <a href="#contact" class="btn-secondary bg-slate-800 hover:bg-slate-700 text-white px-6 py-3 rounded-lg font-medium transition-colors border border-slate-700">Επικοινωνία</a>\r\n          </div>';
const oldCTA2 = '<div class="flex flex-wrap justify-center md:justify-start gap-4">\n            <a href="#cv" class="btn-primary bg-blue-600 hover:bg-blue-500 text-white px-6 py-3 rounded-lg font-medium transition-colors">Πλήρες Βιογραφικό</a>\n            <a href="#contact" class="btn-secondary bg-slate-800 hover:bg-slate-700 text-white px-6 py-3 rounded-lg font-medium transition-colors border border-slate-700">Επικοινωνία</a>\n          </div>';
const newCTA = `<div class="flex flex-wrap justify-center md:justify-start gap-4">
            <a href="/epikoinonia" class="btn-primary bg-blue-600 hover:bg-blue-500 text-white px-8 py-3.5 rounded-xl font-bold transition-colors shadow-lg shadow-blue-500/20">Κλείστε Ραντεβού</a>
          </div>`;
iatros = iatros.replace(oldCTA1, newCTA).replace(oldCTA2, newCTA);

// Append links
const targetFooter1 = '              </div>\r\n            </div>\r\n          </section>';
const targetFooter2 = '              </div>\n            </div>\n          </section>';

const linksBlock = `              </div>
            </div>
          </section>

          <!-- SECTION 5: Related Pages (E-E-A-T Internal Linking) -->
          <section class="border-t border-slate-200 pt-16">
            <h3 class="text-xs font-bold text-slate-400 uppercase tracking-widest mb-6">Σχετικές Ενότητες</h3>
            <div class="grid grid-cols-2 md:grid-cols-5 gap-4">
              <a href="/rtms" class="block p-4 rounded-xl border border-slate-100 bg-slate-50 hover:border-blue-500 hover:bg-blue-50 transition-colors text-center group">
                <div class="font-bold text-slate-900 group-hover:text-blue-700">rTMS</div>
              </a>
              <a href="/farmakogonidiomatiki" class="block p-4 rounded-xl border border-slate-100 bg-slate-50 hover:border-blue-500 hover:bg-blue-50 transition-colors text-center group">
                <div class="font-bold text-slate-900 group-hover:text-blue-700">PGx</div>
              </a>
              <a href="/psychometrika" class="block p-4 rounded-xl border border-slate-100 bg-slate-50 hover:border-blue-500 hover:bg-blue-50 transition-colors text-center group">
                <div class="font-bold text-slate-900 group-hover:text-blue-700">Ψυχομετρικά</div>
              </a>
              <a href="/arthra-blog" class="block p-4 rounded-xl border border-slate-100 bg-slate-50 hover:border-blue-500 hover:bg-blue-50 transition-colors text-center group">
                <div class="font-bold text-slate-900 group-hover:text-blue-700">Blog / Evidence</div>
              </a>
              <a href="/epikoinonia" class="block p-4 rounded-xl border border-slate-100 bg-slate-50 hover:border-blue-500 hover:bg-blue-50 transition-colors text-center group">
                <div class="font-bold text-slate-900 group-hover:text-blue-700">Επικοινωνία</div>
              </a>
            </div>
          </section>`;

// Target the LAST section block if there are multiple.
const parts = iatros.includes(targetFooter1) ? iatros.split(targetFooter1) : iatros.split(targetFooter2);
if (parts.length > 1) {
    const end = parts.pop();
    iatros = parts.join(targetFooter1.length > 0 ? targetFooter1 : targetFooter2) + linksBlock + end;
}

fs.writeFileSync('src/pages/iatros.astro', iatros);
console.log('Successfully edited iatros.astro');
