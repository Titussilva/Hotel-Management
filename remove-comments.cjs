const fs = require('fs');
const path = require('path');

const directoriesToProcess = ['src', 'server'];
const fileExtensions = ['.js', '.jsx'];

function processFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  let originalContent = content;

  // Remove JSX comments: {/* ... */}
  content = content.replace(/\{\/\*[\s\S]*?\*\/\}\n?/g, '');

  // Remove block comments: /* ... */ (but not if they look like JSDoc that we might want to keep, or maybe just remove all)
  content = content.replace(/\/\*[\s\S]*?\*\/\n?/g, '');

  // Remove line comments: // ... (avoiding http:// and https://)
  // This looks for // not preceded by :
  content = content.replace(/(?<!:)\/\/.*$/gm, '');

  // Clean up excessive empty lines left by comment removal
  content = content.replace(/\n\s*\n\s*\n/g, '\n\n');

  if (content !== originalContent) {
    fs.writeFileSync(filePath, content, 'utf8');
    console.log('Cleaned:', filePath);
  }
}

function traverse(dir) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);
    if (stat.isDirectory()) {
      traverse(fullPath);
    } else if (fileExtensions.includes(path.extname(fullPath))) {
      processFile(fullPath);
    }
  }
}

for (const dir of directoriesToProcess) {
  const fullPath = path.join(__dirname, dir);
  if (fs.existsSync(fullPath)) {
    traverse(fullPath);
  }
}

console.log('Finished removing comments.');
