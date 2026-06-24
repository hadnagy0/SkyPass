const fs = require('fs');
const https = require('https');

const images = {
  'MUC': 'https://upload.wikimedia.org/wikipedia/commons/thumb/d/d3/Stadtbild_M%C3%BCnchen.jpg/800px-Stadtbild_M%C3%BCnchen.jpg',
  'DUB': 'https://upload.wikimedia.org/wikipedia/commons/thumb/9/92/Dublin_-_aerial_-_2025-07-07_01.jpg/800px-Dublin_-_aerial_-_2025-07-07_01.jpg',
  'VIE': 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/5b/Schoenbrunn_philharmoniker_2012.jpg/800px-Schoenbrunn_philharmoniker_2012.jpg',
  'LIS': 'https://upload.wikimedia.org/wikipedia/commons/thumb/f/f2/Lisboa_-_Portugal_%2852597836992%29.jpg/800px-Lisboa_-_Portugal_%2852597836992%29.jpg'
};

async function download() {
  for (const [iata, url] of Object.entries(images)) {
    const filePath = `src/assets/images/destinations/${iata}.jpg`;
    console.log(`Downloading ${iata}...`);
    
    await new Promise((resolve, reject) => {
      https.get(url, { headers: { 'User-Agent': 'SkyPassApp/1.0' } }, (res) => {
        if (res.statusCode === 200) {
          const file = fs.createWriteStream(filePath);
          res.pipe(file);
          file.on('finish', () => {
            file.close(resolve);
          });
        } else if (res.statusCode === 301 || res.statusCode === 302) {
            https.get(res.headers.location, { headers: { 'User-Agent': 'SkyPassApp/1.0' } }, (res2) => {
                const file = fs.createWriteStream(filePath);
                res2.pipe(file);
                file.on('finish', () => {
                    file.close(resolve);
                });
            });
        } else {
            console.log(`Failed ${iata}: ${res.statusCode}`);
            resolve();
        }
      }).on('error', reject);
    });
  }
}
download();
