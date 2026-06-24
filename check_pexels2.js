const https = require('https');

const ids = [
  '6325984', '6325992', '10531580', '9062369', '11244304', '3452826', '2225000', '11650391'
];

async function check() {
  for (const id of ids) {
    const url = `https://images.pexels.com/photos/${id}/pexels-photo-${id}.jpeg?auto=compress&cs=tinysrgb&w=400`;
    try {
      const res = await fetch(url, { method: 'HEAD' });
      console.log(`${id}: ${res.status}`);
    } catch(e) {
      console.log(`${id}: Error`);
    }
  }
}
check();
