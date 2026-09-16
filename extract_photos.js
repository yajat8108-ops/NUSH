const fs = require('fs');
const path = require('path');

const htmlContent = fs.readFileSync('d:/COODING/NUSH/yajat-and-nush-one-month.html', 'utf8');

const regex = /<img src="data:image\/(jpeg|png|gif);base64,([^"]+)"/g;
let match;
let count = 1;

const outputDir = 'd:/COODING/NUSH/public/photos';
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

while ((match = regex.exec(htmlContent)) !== null) {
  const ext = match[1] === 'jpeg' ? 'jpg' : match[1];
  const base64Data = match[2];
  const buffer = Buffer.from(base64Data, 'base64');
  
  // Last image is the card
  let filename = `photo-${count}.${ext}`;
  if (htmlContent.indexOf('<figure class="real-card">') !== -1 && match.index > htmlContent.indexOf('<figure class="real-card">')) {
    filename = `card.${ext}`;
  }
  
  fs.writeFileSync(path.join(outputDir, filename), buffer);
  console.log(`Saved ${filename}`);
  count++;
}
