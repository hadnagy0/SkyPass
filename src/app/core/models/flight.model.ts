export interface Flight {
  id: string;
  flightNumber: string;
  airline: string;
  departureAirport: string;
  arrivalAirport: string;
  departureTime: string;
  arrivalTime: string;
  duration: number; // in minute
  basePrice: number;
  isDirect: boolean;
}

export interface PassengerTicket {
  name: string;
  passport: string;
  cabinClass: 'Economy' | 'Business';
  baggage: 'None' | '10kg' | '23kg';
  price: number;
  seat: string;
}

export interface Booking {
  id?: string;
  userId: string | number;
  flightId: string;
  flightDetails: {
    flightNumber: string;
    airline: string;
    departureAirport: string;
    arrivalAirport: string;
    departureTime: string;
  };
  bookingDate: string;
  totalPrice: number;
  passengers: PassengerTicket[];
  rating?: number;
  status?: string;
}

export interface FlightLog {
  id?: string;
  userId: string | number;
  flightNumber: string;
  airline: string;
  departureAirport: string;
  arrivalAirport: string;
  date: string;
  status: 'Efectuat' | 'Planificat' | 'Anulat';
  rating: number; // 1-5 stele
}
