import fs from 'fs';
import path from 'path';
import https from 'https';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const dir = path.join(__dirname, 'public', 'images');
if (!fs.existsSync(dir)) {
  fs.mkdirSync(dir, { recursive: true });
}

const images = {
  'saree1.jpg': 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=800&q=80',
  'saree2.jpg': 'https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?auto=format&fit=crop&w=800&q=80',
  'saree3.jpg': 'https://images.unsplash.com/photo-1595777457583-95e059d581b8?auto=format&fit=crop&w=800&q=80',
  'saree4.jpg': 'https://images.unsplash.com/photo-1611601679655-7c8bc197f0c6?auto=format&fit=crop&w=800&q=80',
  'saree5.jpg': 'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&w=800&q=80',
  'hero_bg.jpg': 'https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?auto=format&fit=crop&w=1600&q=80',
  'owner_profile.jpg': 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=300&q=80',
  'user_avatar.jpg': 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80'
};

function download(filename, url) {
  const dest = path.join(dir, filename);
  if (fs.existsSync(dest) && fs.statSync(dest).size > 1024) {
    console.log(`${filename} already exists with content, skipping download.`);
    return;
  }
  
  console.log(`Downloading ${filename} from source...`);
  const file = fs.createWriteStream(dest);
  
  const options = {
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
    }
  };

  https.get(url, options, (response) => {
    if (response.statusCode === 302 || response.statusCode === 301) {
      https.get(response.headers.location, options, (redirectResponse) => {
        redirectResponse.pipe(file);
      });
    } else {
      response.pipe(file);
    }
    
    file.on('finish', () => {
      file.close();
      console.log(`Downloaded ${filename} successfully.`);
    });
  }).on('error', (err) => {
    try {
      fs.unlinkSync(dest);
    } catch (e) {}
    console.error(`Error downloading ${filename}:`, err.message);
  });
}

for (const [filename, url] of Object.entries(images)) {
  download(filename, url);
}
