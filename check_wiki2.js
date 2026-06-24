const https = require('https');

const urls = {
  'GHV': 'https://upload.wikimedia.org/wikipedia/commons/thumb/e/ef/Brasov_Piata_Sfatului.jpg/400px-Brasov_Piata_Sfatului.jpg',
  'BCN': 'https://upload.wikimedia.org/wikipedia/commons/thumb/e/e6/Sagrada_Familia_2022.jpg/400px-Sagrada_Familia_2022.jpg',
  'MUC': 'https://upload.wikimedia.org/wikipedia/commons/thumb/8/86/Munich_-_Marienplatz_%282%29.jpg/400px-Munich_-_Marienplatz_%282%29.jpg',
  'ZRH': 'https://upload.wikimedia.org/wikipedia/commons/thumb/0/07/Z%C3%BCrich_Limmat_Grossm%C3%BCnster.jpg/400px-Z%C3%BCrich_Limmat_Grossm%C3%BCnster.jpg',
  'VIE': 'https://upload.wikimedia.org/wikipedia/commons/thumb/3/3a/Wien_-_Sch%C3%B6nbrunn_%281%29.JPG/400px-Wien_-_Sch%C3%B6nbrunn_%281%29.JPG',
  'CPH': 'https://upload.wikimedia.org/wikipedia/commons/thumb/9/93/Nyhavn_-_Copenhagen_-_Denmark.jpg/400px-Nyhavn_-_Copenhagen_-_Denmark.jpg',
  'LIS': 'https://upload.wikimedia.org/wikipedia/commons/thumb/2/25/Pra%C3%A7a_do_Com%C3%A9rcio_%28Lisboa%29_1.jpg/400px-Pra%C3%A7a_do_Com%C3%A9rcio_%28Lisboa%29_1.jpg'
};

async function check() {
  for (const [iata, url] of Object.entries(urls)) {
    try {
      const res = await fetch(url, { 
        method: 'HEAD',
        headers: { 'User-Agent': 'SkyPassApp/1.0 (admin@example.com)' }
      });
      console.log(`${iata}: ${res.status}`);
    } catch(e) {
      console.log(`${iata}: Error`);
    }
  }
}
check();
