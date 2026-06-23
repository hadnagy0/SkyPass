import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AIRLINE_LOGOS } from '../../core/utils/logos';

interface AirlinePartner {
  name: string;
  logo: string;
}

@Component({
  selector: 'app-airlines',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="airlines-container">
      <div class="airlines-header">
        <h1>Companiile Aeriene Partenere</h1>
        <p>Alege o companie pentru a vizualiza toate zborurile operate de aceasta.</p>
      </div>

      <div class="airlines-grid">
        <div 
          *ngFor="let airline of airlines" 
          class="airline-card glass-card"
          (click)="filterByAirline(airline.name)"
        >
          <div class="logo-circle">
            <img [src]="airline.logo" [alt]="airline.name" />
          </div>
          <h3>{{ airline.name }}</h3>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .airlines-container {
      padding: 2rem;
      max-width: 1200px;
      margin: 0 auto;
    }
    .airlines-header {
      text-align: center;
      margin-bottom: 4rem;
      margin-top: 2rem;
    }
    .airlines-header h1 {
      font-size: 2.5rem;
      color: #fff;
      margin-bottom: 1rem;
    }
    .airlines-header p {
      color: #a0aec0;
      font-size: 1.2rem;
    }
    .airlines-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
      gap: 2rem;
    }
    .airline-card {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 2rem 1rem;
      cursor: pointer;
      transition: all 0.3s ease;
    }
    .airline-card:hover {
      transform: translateY(-10px);
      box-shadow: 0 10px 30px rgba(0, 242, 254, 0.2);
      border-color: #00F2FE;
    }
    .logo-circle {
      width: 100px;
      height: 100px;
      border-radius: 50%;
      background: rgba(255, 255, 255, 0.1);
      display: flex;
      align-items: center;
      justify-content: center;
      margin-bottom: 1.5rem;
      overflow: hidden;
      padding: 10px;
      border: 2px solid rgba(255, 255, 255, 0.2);
      transition: all 0.3s ease;
    }
    .airline-card:hover .logo-circle {
      background: rgba(255, 255, 255, 0.2);
      border-color: #00F2FE;
    }
    .logo-circle img {
      max-width: 80%;
      max-height: 80%;
      object-fit: contain;
    }
    .airline-card h3 {
      color: #fff;
      font-size: 1.2rem;
      text-align: center;
      margin: 0;
    }
  `]
})
export class AirlinesComponent {
  private router = inject(Router);

  airlines: AirlinePartner[] = [
    { name: 'Tarom', logo: AIRLINE_LOGOS['tarom'] },
    { name: 'Wizz Air', logo: AIRLINE_LOGOS['wizzair'] },
    { name: 'Lufthansa', logo: AIRLINE_LOGOS['lufthansa'] },
    { name: 'Air France', logo: AIRLINE_LOGOS['airfrance'] },
    { name: 'KLM', logo: AIRLINE_LOGOS['klm'] },
    { name: 'British Airways', logo: AIRLINE_LOGOS['britishairways'] },
    { name: 'Ryanair', logo: AIRLINE_LOGOS['ryanair'] },
    { name: 'ITA Airways', logo: AIRLINE_LOGOS['itaairways'] }
  ];

  filterByAirline(name: string): void {
    this.router.navigate(['/feed'], { queryParams: { airline: name } });
  }
}
