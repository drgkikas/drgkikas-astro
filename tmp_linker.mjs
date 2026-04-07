import fs from 'fs';
import path from 'path';

const contentDir = path.join(process.cwd(), 'src/content/rtms');

const links = [
  { term: '\\bTRD\\b', url: '/rtms/endixeis/trd', label: 'TRD' },
  { term: 'Ανθεκτική Κατάθλιψη', url: '/rtms/endixeis/trd' },
  { term: '\\bDLPFC\\b', url: '/rtms/pos-leitourgei/dlpfc' },
  { term: 'Πλαγιοραχιαίος προμετωπιαίος φλοιός', url: '/rtms/pos-leitourgei/dlpfc' },
  { term: '\\bMEP\\bs?', url: '/rtms/pos-leitourgei/mep' },
  { term: 'Motor Evoked Potential', url: '/rtms/pos-leitourgei/mep' },
  { term: 'Κινητικό Προκλητό Δυναμικό', url: '/rtms/pos-leitourgei/mep' },
  { term: 'Motor [Tt]hreshold', url: '/rtms/pos-leitourgei/motor-threshold' },
  { term: 'Κινητικός Ουδός', url: '/rtms/pos-leitourgei/motor-threshold' },
  { term: '\\bRMT\\b', url: '/rtms/pos-leitourgei/motor-threshold' },
  { term: '\\bAMT\\b', url: '/rtms/pos-leitourgei/motor-threshold' },
  { term: 'Νευροπλαστικότητα(ς)?', url: '/rtms/pos-leitourgei/neuroplasticity' },
  { term: '\\bOCD\\b', url: '/rtms/endixeis/ocd' },
  { term: 'Ιδεοψυχαναγκαστική(ς)?(\\s[Δδ]ιαταραχή)?', url: '/rtms/endixeis/ocd' },
  { term: '\\biTBS\\b', url: '/rtms/core/ti-einai' },
  { term: 'Theta Burst Stimulation', url: '/rtms/core/ti-einai' },
  { term: 'Neural Oscillations', url: '/rtms/pos-leitourgei/neural-oscillations' },
  { term: 'Νευρωνικές ταλαντώσεις', url: '/rtms/pos-leitourgei/neural-oscillations' },
  { term: 'Brain Connectivity', url: '/rtms/pos-leitourgei/brain-connectivity' },
  { term: 'Λειτουργική συνδεσιμότητα(ς)?', url: '/rtms/pos-leitourgei/brain-connectivity' },
  { term: 'Neuromodulation', url: '/rtms/pos-leitourgei/neuromodulation' },
  { term: 'Νευροτροποποίηση(ς)?', url: '/rtms/pos-leitourgei/neuromodulation' }
];

function processFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  
  // Separate frontmatter from body
  const parts = content.split('---');
  if (parts.length < 3) return; // not standard format
  
  const frontmatter = parts[1];
  let body = parts.slice(2).join('---');
  
  let modified = false;

  links.forEach(({ term, url }) => {
    // We only replace if the term isn't already inside a markdown link structure like [text](url)
    // A primitive way is to use a replacer function that checks context, but lookbehinds work well.
    // However, JS regex negative lookbehinds can be tricky with variable lengths.
    // Instead we find all matches and only replace the first one that is NOT inside brackets.
    
    // Create regex. i = ignore case, g = global
    const regex = new RegExp(`(${term})`, 'gi');
    let matches = [...body.matchAll(regex)];
    
    for (let match of matches) {
      const matchText = match[0];
      const matchIndex = match.index;
      
      // Check if it's already a link by looking back on the string.
      const prefix = body.substring(0, matchIndex);
      
      // If there's an unmatched '[' before it, or if there's a '](' right after it, it's likely a link
      const openBrackets = (prefix.match(/\\[/g) || []).length;
      const closeBrackets = (prefix.match(/\\]/g) || []).length;
      
      // Check if it's inside an anchor tag
      const openTags = (prefix.match(/<a\\b/g) || []).length;
      const closeTags = (prefix.match(/<\\/a>/g) || []).length;
      
      if (openBrackets !== closeBrackets || openTags !== closeTags) {
        continue; // inside a link, skip
      }
      
      // Replace just this match
      body = body.substring(0, matchIndex) + `[${matchText}](${url})` + body.substring(matchIndex + matchText.length);
      modified = true;
      break; // Only replace the FIRST valid occurrence per file
    }
  });

  if (modified) {
    const newContent = `---${frontmatter}---${body}`;
    fs.writeFileSync(filePath, newContent, 'utf8');
    console.log(`Updated: ${filePath}`);
  }
}

function walk(dir) {
  const list = fs.readdirSync(dir);
  list.forEach((file) => {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);
    if (stat && stat.isDirectory()) {
      walk(fullPath);
    } else if (file.endsWith('.md')) {
      processFile(fullPath);
    }
  });
}

walk(contentDir);
console.log("Done interlinking!");
