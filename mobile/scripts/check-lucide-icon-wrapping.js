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
  return [...content.matchAll(tagPattern)];
}

function main() {
  const violations = [];

  for (const file of listTargetFiles(SRC_DIR)) {
    const content = fs.readFileSync(file, 'utf8');
    const iconNames = getLucideImportNames(content);

    for (const name of iconNames) {
      const usages = findBareUsages(content, name);
      if (usages.length > 0) {
        violations.push({ file: path.relative(process.cwd(), file), name, count: usages.length });
      }
    }
  }

  if (violations.length > 0) {
    console.error('Icons not wrapped in <Icon as={...}>:');
    for (const v of violations) {
      console.error(`  ${v.file}: <${v.name}> x${v.count}`);
    }
    process.exit(1);
  }

  console.log('Icon check succeeded');
}

main();
