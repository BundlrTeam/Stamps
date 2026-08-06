const fs = require('fs');
const path = require('path');

// Read env variables
let env = {};
try {
  const envPath = path.resolve(__dirname, '../.env');
  if (fs.existsSync(envPath)) {
    const content = fs.readFileSync(envPath, 'utf8');
    const lines = content.split('\r\n').join('\n').split('\n');
    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith('#')) continue;
      const index = trimmed.indexOf('=');
      if (index !== -1) {
        const key = trimmed.substring(0, index).trim();
        let value = trimmed.substring(index + 1).trim();
        if (value.startsWith('"') && value.endsWith('"')) {
          value = value.substring(1, value.length - 1);
        } else if (value.startsWith("'") && value.endsWith("'")) {
          value = value.substring(1, value.length - 1);
        }
        env[key] = value;
      }
    }
  }
} catch (e) {
  console.error('Error reading .env:', e.message);
}

const supabaseUrl = env['SUPABASE_URL'] || process.env['SUPABASE_URL'] || '';
const supabaseKey = env['SUPABASE_KEY'] || process.env['SUPABASE_KEY'] || '';

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing SUPABASE_URL or SUPABASE_KEY in .env');
  process.exit(1);
}

const photosDir = path.resolve(__dirname, '../photos');

function getMimeType(filePath) {
  const ext = path.extname(filePath).toLowerCase();
  if (ext === '.jpg' || ext === '.jpeg') return 'image/jpeg';
  if (ext === '.png') return 'image/png';
  if (ext === '.svg') return 'image/svg+xml';
  return 'application/octet-stream';
}

async function uploadFile(localPath, relativePath) {
  const fileContent = fs.readFileSync(localPath);
  const mimeType = getMimeType(localPath);
  // Storage API path: /storage/v1/object/[bucket]/[path]
  const cleanPath = relativePath.replace(/\\/g, '/');
  const url = `${supabaseUrl.replace(/\/$/, '')}/storage/v1/object/photos/${cleanPath}`;

  console.log(`Uploading ${cleanPath}...`);
  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'apikey': supabaseKey,
        'Authorization': `Bearer ${supabaseKey}`,
        'Content-Type': mimeType
      },
      body: fileContent
    });

    if (response.ok) {
      console.log(`Successfully uploaded: ${cleanPath}`);
    } else {
      const errText = await response.text();
      // If already exists, try to overwrite with PUT
      if (response.status === 400 || errText.includes('Duplicate') || errText.includes('already exists')) {
        const putResponse = await fetch(url, {
          method: 'PUT',
          headers: {
            'apikey': supabaseKey,
            'Authorization': `Bearer ${supabaseKey}`,
            'Content-Type': mimeType
          },
          body: fileContent
        });
        if (putResponse.ok) {
          console.log(`Successfully updated: ${cleanPath}`);
        } else {
          console.error(`Failed to update ${cleanPath}:`, await putResponse.text());
        }
      } else {
        console.error(`Failed to upload ${cleanPath}:`, errText);
      }
    }
  } catch (err) {
    console.error(`Network error uploading ${cleanPath}:`, err.message);
  }
}

async function walkAndUpload(dir, baseDir) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);
    if (stat.isDirectory()) {
      await walkAndUpload(fullPath, baseDir);
    } else {
      const relativePath = path.relative(baseDir, fullPath);
      await uploadFile(fullPath, relativePath);
    }
  }
}

async function main() {
  if (!fs.existsSync(photosDir)) {
    console.error(`Photos directory not found at ${photosDir}`);
    return;
  }
  console.log('Starting upload of local photos to Supabase Storage...');
  await walkAndUpload(photosDir, photosDir);
  console.log('Upload process completed.');
}

main();
