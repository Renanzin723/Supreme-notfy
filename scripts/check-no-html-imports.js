import { glob } from 'glob';
import fs from 'fs';

const files = glob.sync('src/**/*.{ts,tsx,js,jsx}');
const bad = [];

for (const f of files) {
  const content = fs.readFileSync(f, 'utf8');
  
  // Check for import statements with .html files
  if (/\bfrom\s+['"].+\.html['"]/.test(content) || 
      /require\(.+\.html\)/.test(content) ||
      /import\s+.*\s+from\s+['"].+\.html['"]/.test(content)) {
    bad.push(f);
  }
}

if (bad.length > 0) {
  console.error('❌ Não importe .html no código. Mova para /public/templates e use fetch():');
  bad.forEach(file => console.error(`  - ${file}`));
  console.error('\nExemplo de como fazer:');
  console.error('async function loadTemplate(path: string) {');
  console.error('  const res = await fetch(path, { cache: "no-store" });');
  console.error('  if (!res.ok) throw new Error("Falha ao carregar template");');
  console.error('  return res.text();');
  console.error('}');
  process.exit(1);
} else {
  console.log('✅ Sem imports de .html encontrados.');
}
