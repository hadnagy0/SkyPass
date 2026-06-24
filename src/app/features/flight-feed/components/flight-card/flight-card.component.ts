import { Component, input, output, HostListener, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NzCardModule } from 'ng-zorro-antd/card';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { Flight } from '../../../../core/models/flight.model';
import { AIRLINE_LOGOS } from '../../../../core/utils/logos';

@Component({
  selector: 'app-flight-card',
  standalone: true,
  imports: [CommonModule, NzCardModule, NzButtonModule],
  template: `
    <nz-card class="glass-card flight-card" [nzCover]="coverTemplate">
      <div class="flight-card-header">
        <h3>
          <img [src]="getLogoUrl()" alt="Logo" style="height:24px; vertical-align:middle; margin-right:8px;" onerror="this.style.display='none'" />
          {{ flight().airline }} <small>({{ flight().flightNumber }})</small>
        </h3>
        <span class="price">€{{ flight().basePrice }}</span>
      </div>
      <div class="flight-card-body">
        <div class="route">
          <div class="airport-info">
            <strong>{{ flight().departureAirport }}</strong>
            <span class="city-name">{{ getCityName(flight().departureAirport) }}</span>
          </div>
          <span>{{ flight().departureTime | date:'shortTime' }}</span>
        </div>
        <div class="duration-line">
          <span>{{ flight().duration }} min</span>
          <div class="line"></div>
          <span>{{ flight().isDirect ? 'Direct' : '1 Escală' }}</span>
        </div>
        <div class="route destination-route">
          <div class="airport-info">
            <strong>{{ flight().arrivalAirport }}</strong>
            <span class="city-name">{{ getCityName(flight().arrivalAirport) }}</span>
          </div>
          <span>{{ flight().arrivalTime | date:'shortTime' }}</span>
          <img [src]="getDestinationImageUrl(flight().arrivalAirport)" class="dest-thumbnail" alt="Destination" />
        </div>
      </div>
      <div class="flight-card-footer">
        <button nz-button nzType="primary" nzBlock nzSize="large" (click)="onBook()" class="btn-book">
          Rezervă cu €{{ flight().basePrice }}
        </button>
      </div>
    </nz-card>
    <ng-template #coverTemplate>
      <div class="card-cover-wrapper logo-cover">
        <img alt="Airline Logo" [src]="getLogoUrl()" onerror="this.style.display='none'" />
      </div>
    </ng-template>
  `,
  styles: [`
    :host {
      display: block;
      --mouse-x: 50%;
      --mouse-y: 50%;
    }
    .ant-card.glass-card {
      background: linear-gradient(to bottom, rgba(10, 25, 47, 0.7), rgba(10, 25, 47, 0.95)), url('/assets/sky-bg.jpg') no-repeat center center !important;
      background-size: cover !important;
      backdrop-filter: blur(10px);
      border: 1px solid rgba(255, 255, 255, 0.1);
      border-radius: 16px;
      color: #fff;
      transition: transform 0.2s, box-shadow 0.2s;
      overflow: hidden;
      position: relative;
    }
    .glass-card::before {
      content: '';
      position: absolute;
      top: 0; left: 0; right: 0; bottom: 0;
      background: radial-gradient(
        800px circle at var(--mouse-x) var(--mouse-y),
        rgba(0, 242, 254, 0.15),
        transparent 40%
      );
      pointer-events: none;
      z-index: 10;
      opacity: 0;
      transition: opacity 0.3s;
    }
    .glass-card:hover::before {
      opacity: 1;
    }
    .glass-card:hover {
      transform: translateY(-5px);
      box-shadow: 0 15px 30px rgba(0,0,0,0.5);
    }
    .card-cover-wrapper {
      height: 160px;
      width: 100%;
      overflow: hidden;
    }
    .logo-cover {
      display: flex;
      justify-content: center;
      align-items: center;
      background: rgba(255, 255, 255, 0.9);
      padding: 1rem;
    }
    .logo-cover img {
      height: 90px;
      width: auto;
      object-fit: contain;
      transition: transform 0.3s ease;
    }
    .glass-card:hover .logo-cover img {
      transform: scale(1.05);
    }
    ::ng-deep .glass-card .ant-card-body {
      padding: 24px;
      background: transparent !important;
    }
    .flight-card-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      border-bottom: 1px solid rgba(255,255,255,0.1);
      padding-bottom: 1rem;
      margin-bottom: 1.5rem;
    }
    .flight-card-header h3 {
      color: #fff;
      margin: 0;
      font-size: 1.4rem;
    }
    .flight-card-header small {
      color: #aaa;
      font-size: 1rem;
    }
    .price {
      font-size: 1.8rem;
      font-weight: bold;
      color: #ffd700;
    }
    .flight-card-body {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 2rem;
    }
    .route {
      display: flex;
      flex-direction: column;
      align-items: center;
      position: relative;
    }
    .destination-route {
      align-items: flex-end;
      text-align: right;
    }
    .dest-thumbnail {
      width: 40px;
      height: 40px;
      border-radius: 50%;
      object-fit: cover;
      margin-top: 8px;
      border: 2px solid rgba(0, 242, 254, 0.5);
      box-shadow: 0 0 10px rgba(0, 242, 254, 0.3);
      transition: transform 0.3s;
    }
    .dest-thumbnail:hover {
      transform: scale(1.2);
    }
    .airport-info {
      display: flex;
      flex-direction: column;
    }
    .city-name {
      font-size: 0.8rem;
      color: #a0aec0;
      font-weight: 300;
    }
    .duration-line {
      display: flex;
      flex-direction: column;
      align-items: center;
    }
    .route strong { font-size: 1.2rem; }
    .route span { color: #aaa; font-size: 0.9rem; }
    .duration-line {
      flex: 1;
      display: flex;
      flex-direction: column;
      align-items: center;
      margin: 0 1rem;
      color: #aaa;
      font-size: 0.8rem;
    }
    .line {
      width: 100%;
      height: 2px;
      background: #aaa;
      margin: 4px 0;
      position: relative;
    }
    .line::after {
      content: '';
      position: absolute;
      right: 0;
      top: -3px;
      border-top: 4px solid transparent;
      border-bottom: 4px solid transparent;
      border-left: 6px solid #aaa;
    }
    .btn-book {
      background: linear-gradient(135deg, var(--secondary-accent), var(--primary-accent));
      color: #0B0F19 !important;
      border: none;
      border-radius: 8px;
      font-weight: 800;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
      transition: box-shadow 0.2s ease;
    }
    .btn-book:hover {
      box-shadow: 0 0 15px rgba(0, 242, 254, 0.5);
    }
  `]
})
export class FlightCardComponent {
  flight = input.required<Flight>();
  bookClicked = output<string>();

  constructor(private el: ElementRef) {}

  @HostListener('mousemove', ['$event'])
  onMouseMove(event: MouseEvent) {
    const rect = this.el.nativeElement.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    this.el.nativeElement.style.setProperty('--mouse-x', `${x}px`);
    this.el.nativeElement.style.setProperty('--mouse-y', `${y}px`);
  }

  onBook(): void {
    this.bookClicked.emit(this.flight().id);
  }

  getLogoUrl(): string {
    const name = this.flight().airline.toLowerCase();
    let key = 'skyscanner';
    if (name.includes('tarom')) key = 'tarom';
    else if (name.includes('wizz')) key = 'wizzair';
    else if (name.includes('lufthansa')) key = 'lufthansa';
    else if (name.includes('ita')) key = 'itaairways';
    else if (name.includes('air france')) key = 'airfrance';
    else if (name.includes('klm')) key = 'klm';
    else if (name.includes('british')) key = 'britishairways';
    else if (name.includes('ryanair')) key = 'ryanair';
    
    return AIRLINE_LOGOS[key] || AIRLINE_LOGOS['skyscanner'] || '';
  }

  getCityName(iata: string): string {
    const airports: Record<string, string> = {
      'GHV': 'Brașov-Ghimbav',
      'OTP': 'București Otopeni',
      'CDG': 'Paris Charles de Gaulle',
      'LHR': 'London Heathrow',
      'FRA': 'Frankfurt am Main',
      'AMS': 'Amsterdam Schiphol',
      'MAD': 'Madrid Barajas',
      'BCN': 'Barcelona El Prat',
      'FCO': 'Roma Fiumicino',
      'MUC': 'München',
      'IST': 'Istanbul',
      'VIE': 'Viena Schwechat',
      'ATH': 'Atena',
      'ZRH': 'Zürich',
      'CPH': 'Copenhaga Kastrup',
      'DUB': 'Dublin',
      'LIS': 'Lisabona'
    };
    return airports[iata] || iata;
  }

  getDestinationImageUrl(iata: string): string {
    const urls: Record<string, string> = {
      'CDG': 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=100&h=100&fit=crop', // Paris
      'LHR': 'https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?w=100&h=100&fit=crop', // London
      'FCO': 'https://images.unsplash.com/photo-1552832230-c0197dd311b5?w=100&h=100&fit=crop', // Rome
      'BCN': 'https://images.unsplash.com/photo-1583422409516-2895a77efded?w=100&h=100&fit=crop', // Barcelona
      'MAD': 'https://images.unsplash.com/photo-1539037116277-4db20889f2d4?w=100&h=100&fit=crop', // Madrid
      'OTP': 'https://images.unsplash.com/photo-1584646098378-0874589d76b1?w=100&h=100&fit=crop', // Bucharest
      'AMS': 'https://images.unsplash.com/photo-1512470876302-972faa2aa9a4?w=100&h=100&fit=crop', // Amsterdam
      'ATH': 'https://images.unsplash.com/photo-1603565816030-6b389eeb23cb?w=100&h=100&fit=crop', // Athens
      'IST': 'https://images.unsplash.com/photo-1524231757912-21f4fe3a7200?w=100&h=100&fit=crop', // Istanbul
      'DUB': 'https://images.unsplash.com/photo-1605969353711-234dea348ce1?w=100&h=100&fit=crop', // Dublin
      'GHV': 'https://images.unsplash.com/photo-1558253347-fb1128610003?w=100&h=100&fit=crop', // Brasov
      'MUC': 'https://images.unsplash.com/photo-1595867818082-083862f3d630?w=100&h=100&fit=crop', // Munich
      'ZRH': 'https://images.unsplash.com/photo-1620563092215-0fbc6b55cfc5?w=100&h=100&fit=crop', // Zurich
      'FRA': 'https://images.unsplash.com/photo-1494522855154-9297ac14b55f?w=100&h=100&fit=crop', // Frankfurt
      'VIE': 'https://images.unsplash.com/photo-1516550893923-42d28e5677af?w=100&h=100&fit=crop', // Vienna
      'CPH': 'https://images.unsplash.com/photo-1513622470522-26c3c8a854bc?w=100&h=100&fit=crop', // Copenhagen
      'LIS': 'https://images.unsplash.com/photo-1585208798174-6cedd86e019a?w=100&h=100&fit=crop' // Lisbon
    };
    return urls[iata] || 'https://images.unsplash.com/photo-1436491865332-7a61a109cc05?w=100&h=100&fit=crop'; // Default airplane view
  }
}
