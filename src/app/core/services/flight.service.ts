import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Flight, Booking, FlightLog } from '../models/flight.model';

@Injectable({
  providedIn: 'root'
})
export class FlightService {
  private http = inject(HttpClient);
  private readonly API_URL = 'http://localhost:3000';

  // 1. Catalogul de zboruri disponibile pentru Feed
  getAvailableFlights(): Observable<Flight[]> {
    return this.http.get<Flight[]>(`${this.API_URL}/flightsCatalog`);
  }

  getFlightById(id: string): Observable<Flight> {
    return this.http.get<Flight>(`${this.API_URL}/flightsCatalog/${id}`);
  }

  // 2. Colectia de Rezervari finale (Bilete cumparate)
  createBooking(booking: Booking): Observable<Booking> {
    return this.http.post<Booking>(`${this.API_URL}/bookings`, booking);
  }

  updateBooking(id: string, booking: Booking): Observable<Booking> {
    return this.http.put<Booking>(`${this.API_URL}/bookings/${id}`, booking);
  }

  getBookings(): Observable<Booking[]> {
    return this.http.get<Booking[]>(`${this.API_URL}/bookings`);
  }

  deleteBooking(id: string): Observable<void> {
    return this.http.delete<void>(`${this.API_URL}/bookings/${id}`);
  }

  // 3. Jurnalul manual personal de calatorii (Tabelul CRUD B)
  getFlightLogs(): Observable<FlightLog[]> {
    return this.http.get<FlightLog[]>(`${this.API_URL}/flightLogs`);
  }

  addFlightLog(log: FlightLog): Observable<FlightLog> {
    return this.http.post<FlightLog>(`${this.API_URL}/flightLogs`, log);
  }

  updateFlightLog(id: string, log: FlightLog): Observable<FlightLog> {
    return this.http.put<FlightLog>(`${this.API_URL}/flightLogs/${id}`, log);
  }

  deleteFlightLog(id: string): Observable<void> {
    return this.http.delete<void>(`${this.API_URL}/flightLogs/${id}`);
  }
}
