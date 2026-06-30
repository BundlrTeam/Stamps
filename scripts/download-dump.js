const fs = require('fs');
const path = require('path');
const https = require('https');

const IMAGES = [
  { url: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=900&h=650&fit=crop', dest: 'businesses/pizzaria-bella/main.jpg' },
  { url: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=900&h=650&fit=crop', dest: 'businesses/pizzaria-bella/gallery1.jpg' },
  { url: 'https://images.unsplash.com/photo-1593560708920-61dd98c46a4e?w=900&h=650&fit=crop', dest: 'businesses/pizzaria-bella/gallery2.jpg' },
  { url: 'https://images.unsplash.com/photo-1590947132387-155cc02f3212?w=120&h=120&fit=crop', dest: 'businesses/pizzaria-bella/logo.jpg' },

  { url: 'https://images.unsplash.com/photo-1571997478779-2adcbbe9ab2f?w=900&h=650&fit=crop', dest: 'businesses/forno-do-bairro/main.jpg' },
  { url: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=900&h=650&fit=crop', dest: 'businesses/forno-do-bairro/gallery1.jpg' },
  { url: 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=900&h=650&fit=crop', dest: 'businesses/forno-do-bairro/gallery2.jpg' },
  { url: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=120&h=120&fit=crop', dest: 'businesses/forno-do-bairro/logo.jpg' },

  { url: 'https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=900&h=650&fit=crop', dest: 'businesses/sushi-bar/main.jpg' },
  { url: 'https://images.unsplash.com/photo-1557872943-16a5ac26437e?w=900&h=650&fit=crop', dest: 'businesses/sushi-bar/gallery1.jpg' },
  { url: 'https://images.unsplash.com/photo-1585032226651-759b368d7246?w=900&h=650&fit=crop', dest: 'businesses/sushi-bar/gallery2.jpg' },
  { url: 'https://images.unsplash.com/photo-1557872943-16a5ac26437e?w=120&h=120&fit=crop', dest: 'businesses/sushi-bar/logo.jpg' },

  { url: 'https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?w=900&h=650&fit=crop', dest: 'businesses/cafe-progresso/main.jpg' },
  { url: 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=900&h=650&fit=crop', dest: 'businesses/cafe-progresso/gallery1.jpg' },
  { url: 'https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=900&h=650&fit=crop', dest: 'businesses/cafe-progresso/gallery2.jpg' },
  { url: 'https://images.unsplash.com/photo-1541167760496-1628856ab772?w=120&h=120&fit=crop', dest: 'businesses/cafe-progresso/logo.jpg' },

  { url: 'https://images.unsplash.com/photo-1442512595331-e89e73853f31?w=900&h=650&fit=crop', dest: 'businesses/confeitaria-carmo/main.jpg' },
  { url: 'https://images.unsplash.com/photo-1521017432531-fbd92d768814?w=900&h=650&fit=crop', dest: 'businesses/confeitaria-carmo/gallery1.jpg' },
  { url: 'https://images.unsplash.com/photo-1554118811-1e0d58224f24?w=900&h=650&fit=crop', dest: 'businesses/confeitaria-carmo/gallery2.jpg' },
  { url: 'https://images.unsplash.com/photo-1497935586351-b67a49e012bf?w=120&h=120&fit=crop', dest: 'businesses/confeitaria-carmo/logo.jpg' },

  { url: 'https://images.unsplash.com/photo-1503951914875-452162b0f3f1?w=900&h=650&fit=crop', dest: 'businesses/barbearia-nacional/main.jpg' },
  { url: 'https://images.unsplash.com/photo-1621605815971-fbc98d665033?w=900&h=650&fit=crop', dest: 'businesses/barbearia-nacional/gallery1.jpg' },
  { url: 'https://images.unsplash.com/photo-1585747860715-2ba37e788b70?w=900&h=650&fit=crop', dest: 'businesses/barbearia-nacional/gallery2.jpg' },
  { url: 'https://images.unsplash.com/photo-1585747860715-2ba37e788b70?w=120&h=120&fit=crop', dest: 'businesses/barbearia-nacional/logo.jpg' },

  { url: 'https://images.unsplash.com/photo-1560066984-138dadb4c035?w=900&h=650&fit=crop', dest: 'businesses/spa-zen/main.jpg' },
  { url: 'https://images.unsplash.com/photo-1604654894610-df63bc536371?w=900&h=650&fit=crop', dest: 'businesses/spa-zen/gallery1.jpg' },
  { url: 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=900&h=650&fit=crop', dest: 'businesses/spa-zen/gallery2.jpg' },
  { url: 'https://images.unsplash.com/photo-1604654894610-df63bc536371?w=120&h=120&fit=crop', dest: 'businesses/spa-zen/logo.jpg' },

  { url: 'https://images.unsplash.com/photo-1514933651103-005eec06c04b?w=900&h=650&fit=crop', dest: 'businesses/cantinho-do-fado/main.jpg' },
  { url: 'https://images.unsplash.com/photo-1536935338788-846bb9981813?w=900&h=650&fit=crop', dest: 'businesses/cantinho-do-fado/gallery1.jpg' },
  { url: 'https://images.unsplash.com/photo-1470337458703-46ad1756a187?w=900&h=650&fit=crop', dest: 'businesses/cantinho-do-fado/gallery2.jpg' },
  { url: 'https://images.unsplash.com/photo-1551024709-8f23befc6f87?w=120&h=120&fit=crop', dest: 'businesses/cantinho-do-fado/logo.jpg' },

  { url: 'https://images.unsplash.com/photo-1572116469696-31de0f17cc34?w=900&h=650&fit=crop', dest: 'businesses/livraria-lelo/main.jpg' },
  { url: 'https://images.unsplash.com/photo-1482440308425-276ad0f28b19?w=900&h=650&fit=crop', dest: 'businesses/livraria-lelo/gallery1.jpg' },
  { url: 'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=900&h=650&fit=crop', dest: 'businesses/livraria-lelo/gallery2.jpg' },
  { url: 'https://images.unsplash.com/photo-1539628399213-d6aa89c93074?w=120&h=120&fit=crop', dest: 'businesses/livraria-lelo/logo.jpg' },

  { url: 'https://images.unsplash.com/photo-1555854877-bab0e564b8d5?w=900&h=650&fit=crop', dest: 'businesses/hostel-ribeira/main.jpg' },
  { url: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=900&h=650&fit=crop', dest: 'businesses/hostel-ribeira/gallery1.jpg' },
  { url: 'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=900&h=650&fit=crop', dest: 'businesses/hostel-ribeira/gallery2.jpg' },
  { url: 'https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=120&h=120&fit=crop', dest: 'businesses/hostel-ribeira/logo.jpg' },

  { url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&h=200&fit=crop&crop=face', dest: 'users/default-avatar.jpg' },
  { url: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=600', dest: 'fallbacks/business-photo1.jpg' },
  { url: 'https://images.unsplash.com/photo-1552566626-52f8b828add9?w=600', dest: 'fallbacks/business-photo2.jpg' },
  { url: 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=600', dest: 'fallbacks/business-photo3.jpg' }
];

const dumpDir = path.resolve(__dirname, '../photos');

// Criar a pasta photos/ se não existir
if (!fs.existsSync(dumpDir)) {
  fs.mkdirSync(dumpDir, { recursive: true });
}

function downloadImage(img, index) {
  return new Promise((resolve) => {
    const destPath = path.join(dumpDir, img.dest);
    const destFolder = path.dirname(destPath);
    
    // Criar a pasta destino se não existir
    if (!fs.existsSync(destFolder)) {
      fs.mkdirSync(destFolder, { recursive: true });
    }

    const file = fs.createWriteStream(destPath);
    const urlObj = new URL(img.url);
    const options = {
      hostname: urlObj.hostname,
      path: urlObj.pathname + urlObj.search,
      rejectUnauthorized: false
    };
    https.get(options, (response) => {
      response.pipe(file);
      file.on('finish', () => {
        file.close();
        console.log(`[${index + 1}/${IMAGES.length}] Descarregado com sucesso: ${img.dest}`);
        resolve(true);
      });
    }).on('error', (err) => {
      fs.unlink(destPath, () => {});
      console.error(`Erro ao descarregar ${img.url}:`, err.message);
      resolve(false);
    });
  });
}

async function run() {
  console.log(`A iniciar download de ${IMAGES.length} fotos para a pasta local "photos/"...`);
  for (let i = 0; i < IMAGES.length; i++) {
    await downloadImage(IMAGES[i], i);
  }
  console.log('Download concluído! Agora pode carregar o conteúdo da pasta "photos/" para o seu bucket "photos" no Supabase.');
}

run();
