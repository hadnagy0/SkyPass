import { Injectable, signal, computed } from '@angular/core';
import { Flight, PassengerTicket } from '../models/flight.model';

@Injectable({
  providedIn: 'root'
})
export class CartService {
  // Signals pentru zborul curent si lista pasagerilor din cos (Angular v21)
  activeFlight = signal<Flight | null>(null);
  cartTickets = signal<PassengerTicket[]>([]);

  // Computed signal care recalculeaza automat pretul total
  totalCartPrice = computed(() => {
    const flight = this.activeFlight();
    if (!flight) return 0;

    const tickets = this.cartTickets();
    const baseSum = tickets.length * flight.basePrice;

    // Adaugam costurile optionale (clasa business, bagaje speciale)
    const optionsSum = tickets.reduce((sum, ticket) => {
      let extra = 0;
      if (ticket.cabinClass === 'Business') {
        extra += 150; // Supliment clasa Business
      }
      if (ticket.baggage === '10kg') {
        extra += 25;  // Supliment bagaj 10kg
      } else if (ticket.baggage === '23kg') {
        extra += 50;  // Supliment bagaj 23kg
      }
      return sum + extra;
    }, 0);

    return baseSum + optionsSum;
  });

  setActiveFlight(flight: Flight): void {
    this.activeFlight.set(flight);
    this.cartTickets.set([]); // Resetam cosul cand se alege alt zbor
  }

  addPassenger(ticket: PassengerTicket): void {
    this.cartTickets.update(tickets => [...tickets, ticket]);
  }

  updatePassenger(index: number, updatedTicket: PassengerTicket): void {
    this.cartTickets.update(tickets => {
      const copy = [...tickets];
      copy[index] = updatedTicket;
      return copy;
    });
  }

  removePassenger(index: number): void {
    this.cartTickets.update(tickets => tickets.filter((_, i) => i !== index));
  }

  clearCart(): void {
    this.activeFlight.set(null);
    this.cartTickets.set([]);
  }
}
