const https = require('https');

const urls = {
  'BCN': 'https://images.pexels.com/photos/1388030/pexels-photo-1388030.jpeg?auto=compress&cs=tinysrgb&w=400',
  'MUC': 'https://images.pexels.com/photos/10363290/pexels-photo-10363290.jpeg?auto=compress&cs=tinysrgb&w=400',
  'ZRH': 'https://images.pexels.com/photos/15291254/pexels-photo-15291254.jpeg?auto=compress&cs=tinysrgb&w=400',
  'VIE': 'https://images.pexels.com/photos/8118012/pexels-photo-8118012.jpeg?auto=compress&cs=tinysrgb&w=400',
  'CPH': 'https://images.pexels.com/photos/3305149/pexels-photo-3305149.jpeg?auto=compress&cs=tinysrgb&w=400',
  'LIS': 'https://images.pexels.com/photos/2501965/pexels-photo-2501965.jpeg?auto=compress&cs=tinysrgb&w=400',
  'GHV': 'https://images.pexels.com/photos/3342697/pexels-photo-3342697.jpeg?auto=compress&cs=tinysrgb&w=400'
};

async function check() {
  for (const [iata, url] of Object.entries(urls)) {
    try {
      const res = await fetch(url, { 
        method: 'HEAD',
        headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)' }
      });
      console.log(`${iata}: ${res.status}`);
    } catch(e) {
      console.log(`${iata}: Error`);
    }
  }
}
check();
