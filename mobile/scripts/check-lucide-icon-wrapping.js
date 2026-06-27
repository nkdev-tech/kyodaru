// lucide-react-native のアイコンを <Icon as={...}> でラップせず
// 直接JSXタグとして使っている箇所がないかチェックする。
const fs = require('fs');
const path = require('path');

const SRC_DIR = path.join(__dirname, '..', 'src');
const IGNORE_FILES = [path.join(SRC_DIR, 'components', 'ui', 'icon.tsx')];

function listTargetFiles(dir) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  return entries.flatMap((entry) => {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) return listTargetFiles(fullPath);
    if (!entry.name.endsWith('.tsx')) return [];
    if (IGNORE_FILES.includes(fullPath)) return [];
    return [fullPath];
  });
}

function getLucideImportNames(content) {
  const match = content.match(/import\s+\{([^}]+)\}\s+from\s+['"]lucide-react-native['"]/);
  if (!match) return [];
  return match[1]
    .split(',')
    .map((s) => s.trim())
    .filter((s) => s && !s.startsWith('type '))
    .map((s) => (s.includes(' as ') ? s.split(' as ')[1].trim() : s));
}

function findBareUsages(content, name) {
  const tagPattern = new RegExp(`<\\s*${name}(?=[\\s/>])`, 'g');
  return [...content.matchAll(tagPattern)].map((m) => content.slice(0, m.index).split('\n').length);
}

function main() {
  const violations = [];

  for (const file of listTargetFiles(SRC_DIR)) {
    const relativeFile = path.relative(process.cwd(), file);
    const content = fs.readFileSync(file, 'utf8');
    const iconNames = getLucideImportNames(content);

    for (const name of iconNames) {
      const lines = findBareUsages(content, name);
      if (lines.length > 0) {
        console.log(`${relativeFile}: <${name}>...violation (line ${lines.join(', ')})`);
        violations.push({ file: relativeFile, name, lines });
      } else {
        console.log(`${relativeFile}: <${name}>...ok`);
      }
    }
  }

  if (violations.length > 0) {
    console.error('Icons not wrapped in <Icon as={...}>:');
    for (const v of violations) {
      console.error(`  ${v.file}:${v.lines.join(',')}: <${v.name}>`);
    }
    process.exit(1);
  }

  console.log('Icon check succeeded');
}

main();
