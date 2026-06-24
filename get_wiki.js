const fs = require('fs');
async function getWikiImage(city) {
  const res = await fetch(`https://en.wikipedia.org/api/rest_v1/page/summary/${city}`);
  const data = await res.json();
  console.log(`${city}: ${data.thumbnail.source}`);
}
getWikiImage('Munich');
getWikiImage('Dublin');
getWikiImage('Vienna');
getWikiImage('Lisbon');
