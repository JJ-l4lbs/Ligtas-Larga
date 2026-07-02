const fs = require('fs');
const path = require('path');

const files = ['1.svg', '2.svg', '3.svg'];
const dir = path.join(__dirname, '../public/triangle-rocket');

files.forEach(file => {
  const filePath = path.join(dir, file);
  if (!fs.existsSync(filePath)) {
    console.error(`File not found: ${filePath}`);
    return;
  }

  let content = fs.readFileSync(filePath, 'utf8');

  // Count matches
  const matches = (content.match(/fill="#ffffff"/g) || []).length;
  console.log(`File: ${file} - Found ${matches} occurrences of fill="#ffffff"`);

  // Replace only the specific artboard rects
  content = content.replace(/fill="#ffffff"/g, 'fill="none"');

  fs.writeFileSync(filePath, content, 'utf8');
  console.log(`File: ${file} - Updated successfully.`);
});
