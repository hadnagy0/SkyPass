const https = require('https');

const urls = {
  'CDG': 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=100&h=100&fit=crop',
  'LHR': 'https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?w=100&h=100&fit=crop',
  'FCO': 'https://images.unsplash.com/photo-1552832230-c0197dd311b5?w=100&h=100&fit=crop',
  'OTP': 'https://images.unsplash.com/photo-1584646098378-0874589d76b1?w=100&h=100&fit=crop',
  'AMS': 'https://images.unsplash.com/photo-1512470876302-972faa2aa9a4?w=100&h=100&fit=crop',
  'ATH': 'https://images.unsplash.com/photo-1603565816030-6b389eeb23cb?w=100&h=100&fit=crop',
  'IST': 'https://images.unsplash.com/photo-1524231757912-21f4fe3a7200?w=100&h=100&fit=crop',
  'DUB': 'https://images.unsplash.com/photo-1549692520-acc6669e2f0c?w=100&h=100&fit=crop',
  'GHV': 'https://images.unsplash.com/photo-1582200254215-63b715fb823d?w=100&h=100&fit=crop',
  'BCN': 'https://images.unsplash.com/photo-1581289144584-601cb8dd2a94?w=100&h=100&fit=crop',
  'MAD': 'https://images.unsplash.com/photo-1539037116277-4db20889f2d4?w=100&h=100&fit=crop',
  'MUC': 'https://images.unsplash.com/photo-1595089222477-86c0e5a8abde?w=100&h=100&fit=crop',
  'ZRH': 'https://images.unsplash.com/photo-1515542706656-82089c25838d?w=100&h=100&fit=crop',
  'FRA': 'https://images.unsplash.com/photo-1494522855154-9297ac14b55f?w=100&h=100&fit=crop',
  'VIE': 'https://images.unsplash.com/photo-1516550893868-9844f2fb9f6c?w=100&h=100&fit=crop',
  'CPH': 'https://images.unsplash.com/photo-1513622470522-26c314a85cead?w=100&h=100&fit=crop',
  'LIS': 'https://images.unsplash.com/photo-1558500201-1b0fdf178f5a?w=100&h=100&fit=crop'
};

async function check() {
  for (const [iata, url] of Object.entries(urls)) {
    try {
      const res = await fetch(url, { method: 'HEAD' });
      console.log(`${iata}: ${res.status}`);
    } catch(e) {
      console.log(`${iata}: Error`);
    }
  }
}
check();
