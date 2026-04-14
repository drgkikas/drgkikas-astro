const fs = require('fs');
const path = require('path');

const PHYSICIAN_ID = "https://drgkikas.gr/#physician";
const CLINIC_ID = "https://drgkikas.gr/#clinic";

function patchLayout() {
  const file = 'src/layouts/Layout.astro';
  let content = fs.readFileSync(file, 'utf8');
  
  // 1. Add schema prop
  content = content.replace("image?: string;", "image?: string;\n  schema?: string;");
  content = content.replace("image = \"/images/dr-gkikas-portrait.jpg\"", "image = \"/images/dr-gkikas-portrait.jpg\",\n  schema");
  
  // 2. Remove old hardcoded script and add dynamic
  const scriptRegex = /<script type="application\/ld\+json" set:html=\{`[\s\S]*?`\} \/>/;
  if (scriptRegex.test(content)) {
      content = content.replace(scriptRegex, "{schema && <script type=\"application/ld+json\" set:html={schema} />}");
  }

  // Handle case where some elements don't get matched perfectly
  fs.writeFileSync(file, content);
  console.log('Layout patched');
}

function patchFile(file, bundleCode) {
  let content = fs.readFileSync(file, 'utf8');
  // insert before the closing frontmatter
  const parts = content.split('---');
  if (parts.length >= 3) {
      const frontmatter = parts[1];
      parts[1] = frontmatter + "\n" + bundleCode + "\n";
      content = parts.join('---');
  }
  // replace <Layout with <Layout schema={schemaBundle}
  content = content.replace(/<Layout/g, "<Layout schema={schemaBundle}");
  fs.writeFileSync(file, content);
  console.log(`Patched ${file}`);
}

// 2. INDEX / HOMEPAGE
const indexBundle = `const schemaBundle = JSON.stringify({
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Physician",
      "@id": "${PHYSICIAN_ID}",
      "name": "Πασχάλης Γκίκας",
      "medicalSpecialty": "Psychiatry",
      "url": "https://drgkikas.gr"
    },
    {
      "@type": "MedicalClinic",
      "@id": "${CLINIC_ID}",
      "name": "Smart CNS Center",
      "address": {
        "@type": "PostalAddress",
        "streetAddress": "Ξενοφώντος 15Α",
        "addressLocality": "Αθήνα",
        "postalCode": "105 57",
        "addressCountry": "GR"
      },
      "telephone": "2118500016"
    },
    {
      "@type": "WebSite",
      "@id": "https://drgkikas.gr/#website",
      "url": "https://drgkikas.gr",
      "name": "Δρ. Πασχάλης Γκίκας - Ψυχίατρος"
    }
  ]
});`;

// 3. EPIKOINONIA
const epikoinoniaBundle = `const schemaBundle = JSON.stringify({
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Physician",
      "@id": "${PHYSICIAN_ID}"
    },
    {
      "@type": "MedicalClinic",
      "@id": "${CLINIC_ID}",
      "name": "Ιδιωτικό Ιατρείο Πασχάλης Γκίκας",
      "address": {
        "@type": "PostalAddress",
        "streetAddress": "Ξενοφώντος 15Α",
        "addressLocality": "Αθήνα",
        "postalCode": "105 57",
        "addressCountry": "GR"
      },
      "telephone": "+302118500016",
      "email": "contact@drgkikas.com",
      "contactPoint": {
          "@type": "ContactPoint",
          "telephone": "+302118500016",
          "contactType": "Customer Service"
      }
    }
  ]
});`;

// 4. IATROS (BIO)
const iatrosBundle = `const schemaBundle = JSON.stringify({
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": ["Person", "Physician"],
      "@id": "${PHYSICIAN_ID}",
      "name": "Πασχάλης Γκίκας",
      "jobTitle": "Ψυχίατρος - Ψυχοθεραπευτής",
      "worksFor": {
        "@id": "${CLINIC_ID}"
      },
      "alumniOf": "Harvard Medical School (Cert), Maastricht University",
      "medicalSpecialty": "Psychiatry",
      "url": "https://drgkikas.gr/iatros"
    }
  ]
});`;

// 5. rTMS HUB
const rtmsBundle = `const schemaBundle = JSON.stringify({
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "MedicalClinic",
      "@id": "${CLINIC_ID}"
    },
    {
      "@type": ["MedicalTherapy", "MedicalProcedure"],
      "name": entry.data.title,
      "description": entry.data.description,
      "provider": { "@id": "${PHYSICIAN_ID}" }
    },
    {
      "@type": "BreadcrumbList",
      "itemListElement": [
        { "@type": "ListItem", "position": 1, "name": "Αρχική", "item": "https://drgkikas.gr/" },
        { "@type": "ListItem", "position": 2, "name": "rTMS", "item": "https://drgkikas.gr/rtms" },
        { "@type": "ListItem", "position": 3, "name": entry.data.title, "item": "https://drgkikas.gr/rtms/" + slug }
      ]
    }
  ]
});`;

// 6. DIATARAXES
// Needs to safely combine FAQ if present
const diataraxesBundle = `
const hasFAQ = Content && Content.toString().includes('FAQ'); // naive check or user manual entry wrapper
const combinedSchemaGraph = [
    {
      "@type": "MedicalCondition",
      "name": entry.data.title,
      "description": entry.data.description,
      "associatedAnatomy": "Brain"
    },
    {
      "@type": "BreadcrumbList",
      "itemListElement": [
        { "@type": "ListItem", "position": 1, "name": "Αρχική", "item": "https://drgkikas.gr/" },
        { "@type": "ListItem", "position": 2, "name": "Διαταραχές", "item": "https://drgkikas.gr/diataraxes" },
        { "@type": "ListItem", "position": 3, "name": entry.data.title, "item": "https://drgkikas.gr/diataraxes/" + slug }
      ]
    }
];

// If there was an existing breadcrumbSchema or FAQ, merge them dynamically on build.
// (diataraxes/[slug] already has breadcrumbSchema built-in, but we will overwrite Layout schema with our entity graph)
const schemaBundle = JSON.stringify({
  "@context": "https://schema.org",
  "@graph": combinedSchemaGraph
});`;

try {
  patchLayout();
  patchFile('src/pages/index.astro', indexBundle);
  patchFile('src/pages/epikoinonia.astro', epikoinoniaBundle);
  patchFile('src/pages/iatros.astro', iatrosBundle);
  patchFile('src/pages/rtms/[...slug].astro', rtmsBundle);
  patchFile('src/pages/diataraxes/[slug].astro', diataraxesBundle);
} catch (e) {
  console.error(e);
}
