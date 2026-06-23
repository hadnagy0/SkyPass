import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, ActivatedRoute } from '@angular/router';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { NzCardModule } from 'ng-zorro-antd/card';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzFormModule } from 'ng-zorro-antd/form';
import { NzSkeletonModule } from 'ng-zorro-antd/skeleton';
import { FlightService } from '../../core/services/flight.service';
import { Flight } from '../../core/models/flight.model';
import { AIRLINE_LOGOS } from '../../core/utils/logos';

import { FlightCardComponent } from './components/flight-card/flight-card.component';

@Component({
  selector: 'app-flight-feed',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    NzCardModule,
    NzButtonModule,
    NzIconModule,
    NzInputModule,
    NzFormModule,
    NzSkeletonModule,
    FlightCardComponent
  ],
  template: `
    <div class="feed-container">
      <div class="about-hero glass-card">
        <h2>Bine ai venit pe SkyPass!</h2>
        <p>
          De peste 10 ani, SkyPass redefinește modul în care călătorești, oferindu-ți o experiență de rezervare 
          rapidă, sigură și complet digitalizată. Colaborăm direct cu cele mai mari companii aeriene din Europa pentru 
          a-ți aduce cele mai bune oferte și zboruri flexibile, adaptate perfect nevoilor tale de business sau vacanță. 
          Prin intermediul tehnologiei noastre avansate „The Portal S”, transformăm orice căutare într-o poartă directă 
          către destinația visurilor tale, garantând un proces premium, fără stres, de la rezervare până la aterizare.
        </p>
      </div>

      <div class="search-hero">
        <h1>Găsește zborul perfect</h1>
        <form nz-form [formGroup]="searchForm" (ngSubmit)="onSearch()" nzLayout="inline" class="search-form">
          <nz-form-item>
            <nz-form-control>
              <input nz-input formControlName="departure" placeholder="Plecare (ex. OTP)" />
            </nz-form-control>
          </nz-form-item>
          <nz-form-item>
            <nz-form-control>
              <input nz-input formControlName="arrival" placeholder="Destinație (ex. CDG)" />
            </nz-form-control>
          </nz-form-item>
          <nz-form-item>
            <nz-form-control>
              <button nz-button type="submit" class="btn-search">Caută zboruri</button>
            </nz-form-control>
          </nz-form-item>
        </form>
      </div>

      <div *ngIf="isSearching()" class="gate-scan-container">
        <div class="gate-logo-wrapper" [class.pulse]="scanComplete()">
          <img src="assets/logo.png" alt="S Logo" class="gate-logo">
          <div class="laser-line" *ngIf="!scanComplete()"></div>
        </div>
        <div class="scan-text">SCANNING PASS...</div>
        
        <div class="skeleton-grid mt-4">
          <nz-card class="glass-card skeleton-card" *ngFor="let i of [1, 2, 3]">
            <nz-skeleton [nzActive]="true" [nzAvatar]="true" [nzParagraph]="{ rows: 4 }"></nz-skeleton>
          </nz-card>
        </div>
      </div>

      <ng-container *ngIf="!isSearching()">
        <div class="flights-group-container" *ngIf="groupedFlights().length > 0; else emptyState">
          <div *ngFor="let group of groupedFlights()" class="airline-section">
            <h2 class="airline-group-title">
              {{ group.airline }}
            </h2>
            <div class="flights-grid">
              <app-flight-card 
                *ngFor="let flight of group.flights" 
                [flight]="flight" 
                (bookClicked)="bookFlight($event)">
              </app-flight-card>
            </div>
          </div>
        </div>
      </ng-container>

      <ng-template #emptyState>
        <div class="empty-state">
          <nz-icon nzType="frown" nzTheme="outline" style="font-size: 48px; margin-bottom: 16px; color: #aaa"></nz-icon>
          <h3>Nu am găsit niciun zbor!</h3>
          <p>Încearcă să modifici filtrele de căutare.</p>
        </div>
      </ng-template>
    </div>
  `,
  styles: [`
    .feed-container {
      max-width: 1200px;
      margin: 0 auto;
      padding: 2rem 1rem;
    }
    .about-hero {
      padding: 2rem;
      margin-bottom: 3rem;
      text-align: center;
      border-color: rgba(0, 242, 254, 0.3) !important;
    }
    .about-hero h2 {
      color: #fff;
      font-size: 2rem;
      margin-bottom: 1rem;
      background: linear-gradient(45deg, #00f2fe, #4facfe);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
    }
    .about-hero p {
      color: #cbd5e0;
      font-size: 1.15rem;
      line-height: 1.6;
      margin: 0 auto;
      max-width: 900px;
    }
    .search-hero {
      text-align: center;
      margin-bottom: 3rem;
      color: #fff;
    }
    .search-hero h1 {
      color: #fff;
      font-size: 2.5rem;
      margin-bottom: 1.5rem;
    }
    .search-form {
      display: flex;
      justify-content: center;
      gap: 1rem;
    }
    ::ng-deep .search-form .ant-input {
      background: rgba(255,255,255,0.1);
      border: 1px solid rgba(255,255,255,0.2);
      color: #fff;
      padding: 10px 20px;
      border-radius: 8px;
    }
    ::ng-deep .search-form .ant-input::placeholder {
      color: #aaa;
    }
    .flights-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(420px, 1fr));
      gap: 2rem;
    }
    .empty-state {
      text-align: center;
      padding: 4rem 2rem;
      background: rgba(255,255,255,0.03);
      border-radius: 12px;
      color: #fff;
    }
    .btn-search {
      background: linear-gradient(135deg, var(--secondary-accent), var(--primary-accent));
      color: #0B0F19;
      border: none;
      border-radius: 8px;
      font-weight: 800;
      padding: 0 1.5rem;
      height: 42px;
    }
    .btn-search:hover {
      box-shadow: 0 0 15px rgba(0, 242, 254, 0.5);
    }
    .gate-scan-container {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 4rem 0;
    }
    .gate-logo-wrapper {
      position: relative;
      width: 120px;
      height: 120px;
      margin-bottom: 1rem;
    }
    .gate-logo {
      width: 100%;
      height: 100%;
      object-fit: contain;
      opacity: 0.8;
    }
    .laser-line {
      position: absolute;
      top: 0;
      left: -10%;
      width: 120%;
      height: 2px;
      background: #00F2FE;
      box-shadow: 0 0 10px #00F2FE, 0 0 20px #00F2FE;
      animation: scanLaser 1.5s ease-in-out infinite alternate;
    }
    @keyframes scanLaser {
      0% { top: 0%; }
      100% { top: 100%; }
    }
    .pulse {
      animation: greenPulse 0.5s ease-out;
    }
    @keyframes greenPulse {
      0% { filter: drop-shadow(0 0 0 rgba(0, 255, 100, 0)); }
      50% { filter: drop-shadow(0 0 30px rgba(0, 255, 100, 1)); }
      100% { filter: drop-shadow(0 0 0 rgba(0, 255, 100, 0)); }
    }
    .scan-text {
      color: #00F2FE;
      font-family: 'Outfit', sans-serif;
      font-weight: 300;
      letter-spacing: 4px;
      font-size: 1.2rem;
      animation: blink 1s infinite alternate;
    }
    .airline-section {
      margin-bottom: 3rem;
      padding-bottom: 3rem;
      border-bottom: 1px solid rgba(255, 255, 255, 0.3);
    }
    .airline-section:last-child {
      border-bottom: none;
    }
    .airline-group-title {
      color: #fff;
      font-size: 1.8rem;
      margin-bottom: 1rem;
      border-bottom: 2px solid rgba(255, 255, 255, 0.1);
      padding-bottom: 10px;
    }
    .flights-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
      gap: 2rem;
    }
    .airline-group-logo {
      height: 30px;
      vertical-align: middle;
      margin-right: 15px;
    }
    .skeleton-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
      gap: 24px;
      margin-top: 3rem;
    }
    .skeleton-card {
      padding: 1.5rem;
    }
    ::ng-deep .skeleton-card .ant-skeleton-title { background: rgba(255, 255, 255, 0.1) !important; }
    ::ng-deep .skeleton-card .ant-skeleton-paragraph > li { background: rgba(255, 255, 255, 0.1) !important; }
    ::ng-deep .skeleton-card .ant-skeleton-avatar { background: rgba(255, 255, 255, 0.1) !important; }
    @keyframes blink {
      0% { opacity: 0.5; }
      100% { opacity: 1; }
    }
  `]
})
export class FlightFeedComponent implements OnInit {
  private flightService = inject(FlightService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private fb = inject(FormBuilder);

  flights = signal<Flight[]>([]);
  isSearching = signal(false);
  scanComplete = signal(false);

  searchForm: FormGroup = this.fb.group({
    departure: [''],
    arrival: ['']
  });

  searchFilters = signal({ departure: '', arrival: '', airline: '' });

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

  groupedFlights = computed(() => {
    const filters = this.searchFilters();
    const dep = filters.departure.toLowerCase();
    const arr = filters.arrival.toLowerCase();
    const air = filters.airline.toLowerCase();

    const filtered = this.flights().filter(f => {
      const depMatch = f.departureAirport.toLowerCase().includes(dep) || this.getCityName(f.departureAirport).toLowerCase().includes(dep);
      const arrMatch = f.arrivalAirport.toLowerCase().includes(arr) || this.getCityName(f.arrivalAirport).toLowerCase().includes(arr);
      const airMatch = !air || f.airline.toLowerCase() === air;
      return depMatch && arrMatch && airMatch;
    });

    const groups: { airline: string, flights: Flight[] }[] = [];
    filtered.forEach(f => {
      let group = groups.find(g => g.airline === f.airline);
      if (!group) {
        group = { airline: f.airline, flights: [] };
        groups.push(group);
      }
      group.flights.push(f);
    });

    return groups.sort((a, b) => a.airline.localeCompare(b.airline));
  });

  ngOnInit(): void {
    this.flightService.getAvailableFlights().subscribe({
      next: (data) => this.flights.set(data),
      error: (err) => console.error('Eroare la încărcarea zborurilor', err)
    });

    this.route.queryParams.subscribe(params => {
      if (params['airline']) {
        this.searchFilters.update(f => ({ ...f, airline: params['airline'] }));
      }
    });
  }

  onSearch(): void {
    this.isSearching.set(true);
    this.scanComplete.set(false);
    
    // Simulate gate scan
    setTimeout(() => {
      this.scanComplete.set(true); // Trigger green pulse
      
      setTimeout(() => {
        this.searchFilters.update(f => ({
          ...f,
          departure: this.searchForm.value.departure || '',
          arrival: this.searchForm.value.arrival || ''
        }));
        this.isSearching.set(false);
      }, 500); // 500ms pulse duration
    }, 1500); // 1.5s scan duration
  }
  
  bookFlight(flightId: string): void {
    this.router.navigate(['/checkout', flightId]);
  }

  getLogoUrl(airline: string): string {
    const name = airline.toLowerCase();
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
}
