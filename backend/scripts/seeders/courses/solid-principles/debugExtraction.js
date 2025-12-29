const fs = require('fs');
const path = require('path');

const mdContent = fs.readFileSync(
  path.join(__dirname, 'SOLID_Principles_Session.md'),
  'utf-8'
);

console.log('MD File length:', mdContent.length, 'characters\n');

// Test the extraction function
function extractContent(startMarker, endMarker) {
  const startIndex = mdContent.indexOf(startMarker);
  if (startIndex === -1) {
    console.log('❌ Start marker not found:', startMarker);
    return '';
  }

  const searchFrom = startIndex + startMarker.length;
  const endIndex = mdContent.indexOf(endMarker, searchFrom);

  if (endIndex === -1) {
    const result = mdContent.substring(startIndex).trim();
    console.log('✅ Found start, no end marker (using rest of file)');
    console.log('   Length:', result.length);
    return result;
  }

  const result = mdContent.substring(startIndex, endIndex).trim();
  console.log('✅ Found both markers');
  console.log('   Length:', result.length);
  return result;
}

// Test each extraction
console.log('Testing SRP extraction:');
console.log('='.repeat(60));
const srpContent = extractContent(
  '# S - Single Responsibility Principle',
  '## SRP Violation #1: AdminPanel.js'
);
console.log('Preview:', srpContent.substring(0, 200));
console.log('');

console.log('Testing SRP Violations extraction:');
console.log('='.repeat(60));
const srpViolationsContent = extractContent(
  '## SRP Violation #1: AdminPanel.js',
  '## How to Fix SRP Violations'
);
console.log('Preview:', srpViolationsContent.substring(0, 200));
