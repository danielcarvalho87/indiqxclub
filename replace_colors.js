const fs = require('fs');
const path = require('path');

const replacements = [
  { search: /bg-gray-900/g, replace: 'bg-brand-surface' },
  { search: /bg-gray-800/g, replace: 'bg-brand-dark' },
  { search: /bg-gray-700/g, replace: 'bg-brand-border' },
  { search: /bg-gray-600/g, replace: 'bg-brand-muted' },
  { search: /text-gray-400/g, replace: 'text-brand-muted' },
  { search: /text-gray-500/g, replace: 'text-brand-muted' },
  { search: /text-gray-300/g, replace: 'text-brand-text' },
  { search: /text-gray-600/g, replace: 'text-brand-muted' },
  { search: /border-gray-800/g, replace: 'border-brand-border' },
  { search: /border-gray-700/g, replace: 'border-brand-border' },
  { search: /border-gray-600/g, replace: 'border-brand-border' },
  { search: /text-white/g, replace: 'text-brand-text' },
  { search: /bg-black\/60/g, replace: 'bg-black/60' }, // keep this one for overlay
];

function walkDir(dir) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      walkDir(fullPath);
    } else if (fullPath.endsWith('.jsx') || fullPath.endsWith('.js')) {
      let content = fs.readFileSync(fullPath, 'utf8');
      let modified = false;
      
      for (const { search, replace } of replacements) {
        if (search.test(content)) {
          content = content.replace(search, replace);
          modified = true;
        }
      }
      
      if (modified) {
        fs.writeFileSync(fullPath, content);
        console.log(`Updated ${fullPath}`);
      }
    }
  }
}

walkDir(path.join(__dirname, 'app/src'));
console.log('Done');