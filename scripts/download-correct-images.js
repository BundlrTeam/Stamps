const fs = require('fs');
const path = require('path');
const https = require('https');
const envPath = path.resolve(__dirname, '../.env');
const envBakPath = path.resolve(__dirname, '../.env.bak');

if (fs.existsSync(envPath)) {
  fs.renameSync(envPath, envBakPath);
}

const { MOCK_BUSINESSES } = require('../backend/seeds');

if (fs.existsSync(envBakPath)) {
  fs.renameSync(envBakPath, envPath);
}

const photosDir = path.resolve(__dirname, '../photos');

// Helper to download an image
function downloadImage(url, destRelativePath) {
  return new Promise((resolve) => {
    const destPath = path.join(photosDir, destRelativePath);
    const destFolder = path.dirname(destPath);

    if (!fs.existsSync(destFolder)) {
      fs.mkdirSync(destFolder, { recursive: true });
    }

    // Skip if already exists and is not empty
    if (fs.existsSync(destPath) && fs.statSync(destPath).size > 0) {
      resolve(true);
      return;
    }

    const file = fs.createWriteStream(destPath);
    const urlObj = new URL(url);
    const options = {
      hostname: urlObj.hostname,
      path: urlObj.pathname + urlObj.search,
      rejectUnauthorized: false
    };

    https.get(options, (response) => {
      if (response.statusCode !== 200) {
        fs.unlink(destPath, () => {});
        resolve(false);
        return;
      }
      response.pipe(file);
      file.on('finish', () => {
        file.close();
        resolve(true);
      });
    }).on('error', (err) => {
      fs.unlink(destPath, () => {});
      console.error(`Error downloading ${url}:`, err.message);
      resolve(false);
    });
  });
}

async function main() {
  console.log('Downloading correct images matching the 13 businesses...');
  let total = 0;
  let downloaded = 0;

  // Prepare list of downloads
  const downloads = [];

  // Default avatar and fallbacks
  downloads.push({ url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&h=200&fit=crop&crop=face', dest: 'users/default-avatar.jpg' });
  downloads.push({ url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&h=200&fit=crop&crop=face', dest: 'users/avatar-default.png' });
  downloads.push({ url: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=600', dest: 'fallbacks/business-photo1.jpg' });
  downloads.push({ url: 'https://images.unsplash.com/photo-1552566626-52f8b828add9?w=600', dest: 'fallbacks/business-photo2.jpg' });
  downloads.push({ url: 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=600', dest: 'fallbacks/business-photo3.jpg' });

  for (const biz of MOCK_BUSINESSES) {
    if (biz.image && biz.image.startsWith('http')) {
      downloads.push({ url: biz.image, dest: `businesses/${biz.id}/main.jpg` });
    }
    if (biz.logo && biz.logo.startsWith('http')) {
      downloads.push({ url: biz.logo, dest: `businesses/${biz.id}/logo.jpg` });
    }
    if (biz.images) {
      biz.images.forEach((img, idx) => {
        if (img && img.startsWith('http')) {
          downloads.push({ url: img, dest: `businesses/${biz.id}/gallery${idx === 0 ? '1' : idx + 1}.jpg` });
        }
      });
    }
  }

  total = downloads.length;
  console.log(`Found ${total} images to download...`);

  for (let i = 0; i < downloads.length; i++) {
    const item = downloads[i];
    console.log(`[${i + 1}/${total}] Downloading ${item.dest}...`);
    const success = await downloadImage(item.url, item.dest);
    if (success) {
      downloaded++;
    } else {
      console.error(`Failed to download ${item.dest}`);
    }
  }

  console.log(`Downloaded ${downloaded}/${total} images.`);
}

main();
