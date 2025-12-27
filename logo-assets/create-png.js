// SVG to PNG converter using headless browser
const fs = require('fs');
const path = require('path');

async function createPNG() {
  const svgPath = path.join(__dirname, 'abel-labs-logo.svg');
  const svgContent = fs.readFileSync(svgPath, 'utf8');
  
  // Create an HTML file that renders the SVG at high resolution
  const html = `<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <style>
        body {
            margin: 0;
            padding: 0;
            background: transparent;
            display: flex;
            justify-content: center;
            align-items: center;
            min-height: 100vh;
        }
        svg {
            display: block;
        }
    </style>
</head>
<body>
    ${svgContent.replace('<svg width="220" height="60"', '<svg width="880" height="240"')}
</body>
</html>`;
  
  fs.writeFileSync(path.join(__dirname, 'render-logo.html'), html);
  console.log('✅ Created render-logo.html');
  console.log('\n📝 To create PNG:');
  console.log('1. Open render-logo.html in Chrome/Safari');
  console.log('2. Press Cmd+Shift+4 (Mac) or use browser DevTools');
  console.log('3. Or use: https://cloudconvert.com/svg-to-png');
  console.log('\n💡 Quick method: Open the SVG in a browser, zoom to 400%, take screenshot');
}

createPNG();












