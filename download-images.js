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

// Highly elegant, handloom-saree women-related photos on Unsplash
const images = {
  'saree1.jpg': 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=800&q=80',
  'saree2.jpg': 'https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?auto=format&fit=crop&w=800&q=80',
  'saree3.jpg': 'https://images.unsplash.com/photo-1595777457583-95e059d581b8?auto=format&fit=crop&w=800&q=80',
  'saree4.jpg': 'https://images.unsplash.com/photo-1611601679655-7c8bc197f0c6?auto=format&fit=crop&w=800&q=80',
  'saree5.jpg': 'https://images.unsplash.com/photo-1605721911519-3dfeb3be25e7?auto=format&fit=crop&w=800&q=80',
  'hero_bg.jpg': 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=1600&h=900&q=80',
  'owner_profile.jpg': 'https://images.unsplash.com/photo-1609357605129-26f69add5d6e?auto=format&fit=crop&w=300&q=80',
  'user_avatar.jpg': 'https://images.unsplash.com/photo-1589156280159-27698a70f29e?auto=format&fit=crop&w=300&q=80'
};

function download(filename, url) {
  const dest = path.join(dir, filename);
  
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
