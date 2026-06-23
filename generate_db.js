const fs = require('fs');

const airlines = ['Tarom', 'Wizz Air', 'Lufthansa', 'Air France', 'KLM', 'British Airways', 'Ryanair', 'ITA Airways'];
const destinations = ['CDG', 'LHR', 'FRA', 'AMS', 'MAD', 'BCN', 'FCO', 'MUC', 'IST', 'VIE', 'ATH', 'ZRH', 'CPH', 'DUB', 'LIS'];

const generateFlights = (departureAirport, count, startIndex) => {
  const flights = [];
  for (let i = 0; i < count; i++) {
    const airline = airlines[Math.floor(Math.random() * airlines.length)];
    const arrivalAirport = destinations[Math.floor(Math.random() * destinations.length)];
    
    // Future date
    const d = new Date();
    d.setDate(d.getDate() + Math.floor(Math.random() * 60) + 1);
    d.setHours(Math.floor(Math.random() * 24), Math.floor(Math.random() * 60), 0, 0);
    const departureTime = d.toISOString();
    
    // Arrival time (+2 to +4 hours)
    const arrTime = new Date(d.getTime() + (Math.floor(Math.random() * 3) + 2) * 3600000);
    const arrivalTime = arrTime.toISOString();
    
    const duration = Math.floor((arrTime.getTime() - d.getTime()) / 60000);
    const basePrice = Math.floor(Math.random() * 300) + 40;
    const isDirect = Math.random() > 0.3;

    flights.push({
      id: (startIndex + i).toString(),
      flightNumber: `${airline.substring(0, 2).toUpperCase()}${Math.floor(1000 + Math.random() * 9000)}`,
      airline,
      departureAirport,
      arrivalAirport,
      departureTime,
      arrivalTime,
      duration,
      basePrice,
      isDirect
    });
  }
  return flights;
};

// We want 30 from GHV (Brasov) and 30 from OTP (Bucuresti)
const flightsGHV = generateFlights('GHV', 30, 1);
const flightsOTP = generateFlights('OTP', 30, 31);
const allFlights = [...flightsGHV, ...flightsOTP];

// Read existing db to keep users, bookings, flightLogs
const dbPath = './db.json';
let db = {};
if (fs.existsSync(dbPath)) {
  const content = fs.readFileSync(dbPath, 'utf8');
  db = JSON.parse(content);
}

db.flightsCatalog = allFlights;

fs.writeFileSync(dbPath, JSON.stringify(db, null, 2));
console.log('Successfully generated 60 flights!');
