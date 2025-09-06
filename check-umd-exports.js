const fs = require('fs');

const content = fs.readFileSync('dist-umd/pitchpro.umd.js', 'utf8');
const lines = content.split('\n');

console.log('📦 Checking UMD Bundle Exports');
console.log('===============================');

// Check last 20 lines for exports
console.log('\n🔚 Last 20 lines:');
console.log(lines.slice(-20).join('\n'));

// Look for export patterns
const exportPatterns = [
  /S\["([^"]+)"\]\s*=/g,
  /exports\.([A-Za-z]+)\s*=/g,
  /S\.([A-Za-z]+)\s*=/g,
];

console.log('\n🔍 Export Patterns Found:');
exportPatterns.forEach((pattern, index) => {
  console.log(`\nPattern ${index + 1}:`);
  let match;
  let found = false;
  while ((match = pattern.exec(content)) !== null) {
    console.log(`  - ${match[1]}`);
    found = true;
    if (found && index === 0 && pattern.lastIndex > content.length - 1000) break; // Only check end for S["..."]
  }
  if (!found) {
    console.log('  - No matches found');
  }
});

// Look for class definitions
console.log('\n🏗️ Class Definitions Found:');
const classPattern = /class\s+([A-Za-z][A-Za-z0-9]*)/g;
let classMatch;
const classes = [];
while ((classMatch = classPattern.exec(content)) !== null) {
  classes.push(classMatch[1]);
}
console.log(`Found ${classes.length} classes:`, classes.join(', '));