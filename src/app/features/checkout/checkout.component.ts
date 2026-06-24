import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { NzTableModule } from 'ng-zorro-antd/table';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzModalModule } from 'ng-zorro-antd/modal';
import { NzFormModule } from 'ng-zorro-antd/form';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzSelectModule } from 'ng-zorro-antd/select';
import { NzPopconfirmModule } from 'ng-zorro-antd/popconfirm';
import { NzCardModule } from 'ng-zorro-antd/card';
import { NzMessageService } from 'ng-zorro-antd/message';
import { FlightService } from '../../core/services/flight.service';
import { AuthService } from '../../core/services/auth.service';
import { Flight, PassengerTicket, Booking } from '../../core/models/flight.model';
import confetti from 'canvas-confetti';

@Component({
  selector: 'app-checkout',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    NzTableModule,
    NzButtonModule,
    NzIconModule,
    NzModalModule,
    NzFormModule,
    NzInputModule,
    NzSelectModule,
    NzPopconfirmModule,
    NzCardModule
  ],
  template: `
    <div class="checkout-container">
      <nz-card class="glass-card mb-4 hero-card" *ngIf="flight() as f">
        <div class="hero-content">
          <div>
            <h2>Rezervare Zbor {{ f.airline }} - {{ f.flightNumber }}</h2>
            <p class="flight-details">
              <strong>{{ f.airline }}</strong> | {{ getCityName(f.departureAirport) }} ({{ f.departureAirport }}) -> <strong>{{ getCityName(f.arrivalAirport) }} ({{ f.arrivalAirport }})</strong><br>
              <small>Plecare: {{ f.departureTime | date:'short' }} | Sosire: {{ f.arrivalTime | date:'short' }}</small><br>
              <span class="price-tag mt-2 block">Preț de bază: €{{ f.basePrice }}</span>
            </p>
          </div>
          <img [src]="getDestinationImageUrl(f.arrivalAirport)" class="hero-thumbnail" alt="Destination" />
        </div>
      </nz-card>

      <nz-card class="glass-card mb-4">
        <div class="table-header">
          <h3>Tabelul A: Pasageri și Opțiuni</h3>
          <div class="actions">
            <nz-input-group [nzPrefix]="searchIcon" class="search-bar">
              <input type="text" nz-input placeholder="Caută pasager..." [formControl]="searchControl" />
            </nz-input-group>
            <ng-template #searchIcon><span nz-icon nzType="search"></span></ng-template>
            
            <button nz-button nzType="primary" (click)="showAddModal()">
              <span nz-icon nzType="plus"></span> Adaugă Pasager
            </button>
          </div>
        </div>

        <nz-table #basicTable [nzData]="filteredPassengers()" [nzFrontPagination]="false" [nzShowPagination]="false">
          <thead>
            <tr>
              <th [nzSortFn]="sortNameFn">Nume Pasager</th>
              <th [nzSortFn]="sortPassportFn">Pașaport</th>
              <th [nzSortFn]="sortClassFn">Clasa</th>
              <th [nzSortFn]="sortBaggageFn">Bagaj</th>
              <th [nzSortFn]="sortSeatFn">Loc</th>
              <th [nzSortFn]="sortPriceFn">Preț Bilet</th>
              <th>Acțiuni</th>
            </tr>
          </thead>
          <tbody>
            <tr *ngFor="let p of basicTable.data; let i = index">
              <td>{{ p.name }}</td>
              <td>{{ p.passport }}</td>
              <td>
                <nz-select [ngModel]="p.cabinClass" (ngModelChange)="updateOption(i, 'cabinClass', $event)" nzBorderless>
                  <nz-option nzValue="Economy" nzLabel="Economy"></nz-option>
                  <nz-option nzValue="Business" nzLabel="Business (+€150)"></nz-option>
                </nz-select>
              </td>
              <td>
                <nz-select [ngModel]="p.baggage" (ngModelChange)="updateOption(i, 'baggage', $event)" nzBorderless>
                  <nz-option nzValue="None" nzLabel="Fără Bagaj"></nz-option>
                  <nz-option nzValue="10kg" nzLabel="10kg (+€30)"></nz-option>
                  <nz-option nzValue="23kg" nzLabel="23kg (+€60)"></nz-option>
                </nz-select>
              </td>
              <td>
                <button nz-button [nzType]="p.seat ? 'default' : 'dashed'" (click)="openSeatMap(i)">
                  {{ p.seat || 'Alege Loc' }}
                </button>
              </td>
              <td><strong>€{{ p.price }}</strong></td>
              <td>
                <button nz-button nzType="text" (click)="openEditModal(i)" title="Editează">
                  <span nz-icon nzType="edit"></span>
                </button>
                <button nz-button nzDanger nzType="text" nz-popconfirm nzPopconfirmTitle="Ștergi pasagerul?" (nzOnConfirm)="removePassenger(i)" title="Șterge">
                  <span nz-icon nzType="delete"></span>
                </button>
              </td>
            </tr>
            <tr *ngIf="passengers().length === 0">
              <td colspan="7" class="text-center text-muted">Niciun pasager adăugat. Adaugă cel puțin unul pentru a continua.</td>
            </tr>
          </tbody>
        </nz-table>
      </nz-card>

      <div class="checkout-footer" *ngIf="passengers().length > 0">
        <h3>Total: <span>€{{ totalPrice() }}</span></h3>
        <button nz-button nzType="primary" nzSize="large" class="btn-buy" (click)="confirmPurchase()" [nzLoading]="isPurchasing()">
          Cumpără Bilete
        </button>
      </div>

      <nz-modal [(nzVisible)]="isModalVisible" nzTitle="Adaugă Pasager Nou" (nzOnCancel)="handleCancel()" (nzOnOk)="handleAddPassenger()">
        <ng-container *nzModalContent>
          <form nz-form [formGroup]="passengerForm">
            <nz-form-item>
              <nz-form-label [nzSm]="6" [nzXs]="24" nzRequired nzFor="name">Nume Complet</nz-form-label>
              <nz-form-control [nzSm]="14" [nzXs]="24" nzErrorTip="Te rog introdu numele!">
                <input nz-input formControlName="name" id="name" placeholder="Ex. Ion Popescu" />
              </nz-form-control>
            </nz-form-item>
            <nz-form-item>
              <nz-form-label [nzSm]="6" [nzXs]="24" nzRequired nzFor="passport">Pașaport</nz-form-label>
              <nz-form-control [nzSm]="14" [nzXs]="24" nzErrorTip="Format pașaport invalid! Ex. AB123456">
                <input nz-input formControlName="passport" id="passport" placeholder="AB123456" />
              </nz-form-control>
            </nz-form-item>
          </form>
        </ng-container>
      </nz-modal>

      <!-- Edit Modal -->
      <nz-modal [(nzVisible)]="isEditModalVisible" nzTitle="Editează Pasager" (nzOnCancel)="handleEditCancel()" (nzOnOk)="handleEditPassenger()">
        <ng-container *nzModalContent>
          <form nz-form [formGroup]="editPassengerForm">
            <nz-form-item>
              <nz-form-label [nzSm]="6" [nzXs]="24" nzRequired nzFor="editName">Nume Complet</nz-form-label>
              <nz-form-control [nzSm]="14" [nzXs]="24" nzErrorTip="Te rog introdu numele!">
                <input nz-input formControlName="name" id="editName" />
              </nz-form-control>
            </nz-form-item>
            <nz-form-item>
              <nz-form-label [nzSm]="6" [nzXs]="24" nzRequired nzFor="editPassport">Pașaport</nz-form-label>
              <nz-form-control [nzSm]="14" [nzXs]="24" nzErrorTip="Format invalid!">
                <input nz-input formControlName="passport" id="editPassport" />
              </nz-form-control>
            </nz-form-item>
          </form>
        </ng-container>
      </nz-modal>

      <!-- Seat Map Modal -->
      <nz-modal [(nzVisible)]="isSeatModalVisible" nzTitle="Alege Locul (Scaun)" (nzOnCancel)="handleSeatCancel()" (nzOnOk)="handleSeatSelect()" nzWidth="400px">
        <ng-container *nzModalContent>
          <div class="airplane-fuselage">
            <div class="cockpit"></div>
            <div class="cabin">
              <div class="row" *ngFor="let row of seatRows">
                <div class="seat-group">
                  <div class="seat" *ngFor="let letter of ['A', 'B', 'C']"
                       [class.occupied]="isSeatOccupied(row + letter)"
                       [class.selected]="selectedSeat === (row + letter)"
                       (click)="selectSeat(row + letter)">
                    {{ letter }}
                  </div>
                </div>
                <div class="aisle">{{ row }}</div>
                <div class="seat-group">
                  <div class="seat" *ngFor="let letter of ['D', 'E', 'F']"
                       [class.occupied]="isSeatOccupied(row + letter)"
                       [class.selected]="selectedSeat === (row + letter)"
                       (click)="selectSeat(row + letter)">
                    {{ letter }}
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div class="seat-legend">
            <div><span class="seat-box free"></span> Liber</div>
            <div><span class="seat-box selected"></span> Selectat</div>
            <div><span class="seat-box occupied"></span> Ocupat</div>
          </div>
        </ng-container>
      </nz-modal>
    </div>
  `,
  styles: [`
    .checkout-container {
      max-width: 1000px;
      margin: 2rem auto;
      padding: 0 1rem;
    }
    .glass-card {
      background: rgba(10, 25, 47, 0.85);
      backdrop-filter: blur(10px);
      border: 1px solid rgba(255, 255, 255, 0.1);
      border-radius: 16px;
      color: #fff;
      padding: 2rem;
    }
    .table-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 1rem;
    }
    .hero-card {
      border: 1px solid rgba(0, 242, 254, 0.3) !important;
    }
    .hero-content {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    .hero-thumbnail {
      width: 120px;
      height: 120px;
      border-radius: 12px;
      object-fit: cover;
      border: 3px solid rgba(0, 242, 254, 0.5);
      box-shadow: 0 0 15px rgba(0, 242, 254, 0.3);
    }
    .hero-card h2 {
      font-size: 2rem;
      text-shadow: 0 2px 4px rgba(0,0,0,0.5);
      color: #fff;
    }
    .hero-card .flight-details {
      font-size: 1.1rem;
      text-shadow: 0 1px 3px rgba(0,0,0,0.5);
    }
    .airplane-fuselage {
      background: #e2e8f0;
      border-radius: 100px 100px 40px 40px;
      padding: 40px 20px 20px 20px;
      margin: 0 auto;
      max-width: 280px;
      box-shadow: inset 0 0 20px rgba(0,0,0,0.1);
    }
    .cockpit {
      height: 40px;
      border-bottom: 2px solid #cbd5e0;
      margin-bottom: 20px;
    }
    .row {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 10px;
    }
    .seat-group {
      display: flex;
      gap: 5px;
    }
    .aisle {
      width: 30px;
      text-align: center;
      color: #718096;
      font-weight: bold;
      font-size: 0.9rem;
    }
    .seat {
      width: 30px;
      height: 35px;
      background: #fff;
      border: 1px solid #cbd5e0;
      border-radius: 5px 5px 2px 2px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 0.7rem;
      color: #a0aec0;
      cursor: pointer;
      transition: all 0.2s;
    }
    .seat:hover:not(.occupied) {
      background: #ebf8ff;
      border-color: #4299e1;
    }
    .seat.occupied {
      background: #feb2b2;
      border-color: #fc8181;
      color: #c53030;
      cursor: not-allowed;
    }
    .seat.selected {
      background: #48bb78;
      border-color: #38a169;
      color: #fff;
      box-shadow: 0 0 10px rgba(72, 187, 120, 0.5);
    }
    .seat-legend {
      display: flex;
      justify-content: center;
      gap: 15px;
      margin-top: 20px;
      color: #fff;
    }
    .seat-box {
      display: inline-block;
      width: 15px;
      height: 15px;
      border-radius: 3px;
      vertical-align: middle;
      margin-right: 5px;
    }
    .seat-box.free { background: #fff; border: 1px solid #cbd5e0; }
    .seat-box.selected { background: #48bb78; }
    .seat-box.occupied { background: #feb2b2; }
    .table-header h3 {
      color: #fff;
      margin: 0;
    }
    .actions {
      display: flex;
      gap: 1rem;
      align-items: center;
    }
    .search-bar {
      width: 200px;
    }
    .flight-details {
      font-size: 1.1rem;
      line-height: 1.6;
    }
    .price-tag {
      font-weight: bold;
      color: #ffd700;
      font-size: 1.2rem;
    }
    ::ng-deep .ant-table {
      background: transparent !important;
      color: #fff !important;
    }
    ::ng-deep .ant-table-thead > tr > th {
      background: rgba(255, 255, 255, 0.1) !important;
      color: #fff !important;
      border-bottom: 1px solid rgba(255, 255, 255, 0.2);
    }
    ::ng-deep .ant-table-tbody > tr > td {
      border-bottom: 1px solid rgba(255, 255, 255, 0.1);
    }
    ::ng-deep .ant-table-tbody > tr:hover > td {
      background: rgba(255, 255, 255, 0.05) !important;
    }
    ::ng-deep .ant-select-selector {
      background: transparent !important;
      color: #fff !important;
    }
    .checkout-footer {
      display: flex;
      justify-content: space-between;
      align-items: center;
      background: rgba(255, 255, 255, 0.1);
      padding: 1.5rem;
      border-radius: 12px;
      margin-top: 2rem;
    }
    .checkout-footer h3 {
      color: #fff;
      margin: 0;
      font-size: 1.5rem;
    }
    .checkout-footer span {
      color: #ffd700;
    }
    .btn-buy {
      background: linear-gradient(135deg, #ffd700, #ff8c00);
      border: none;
      color: #000;
      font-weight: bold;
      border-radius: 8px;
    }
    .btn-buy:hover {
      background: linear-gradient(135deg, #ff8c00, #ffd700);
      color: #000;
    }
    .text-center { text-align: center; }
    .text-muted { color: #aaa; }
    .mb-4 { margin-bottom: 1.5rem; }
  `]
})
export class CheckoutComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private flightService = inject(FlightService);
  private authService = inject(AuthService);
  private fb = inject(FormBuilder);
  private msg = inject(NzMessageService);

  flight = signal<Flight | null>(null);
  passengers = signal<PassengerTicket[]>([]);
  isModalVisible = false;
  isPurchasing = signal(false);

  isSeatModalVisible = false;
  activePassengerIndex: number | null = null;
  selectedSeat: string = '';
  seatRows = Array.from({ length: 15 }, (_, i) => i + 1);
  occupiedSeats: string[] = [];

  passengerForm: FormGroup = this.fb.group({
    name: ['', Validators.required],
    passport: ['', [Validators.required, Validators.pattern(/^[A-Z0-9]{6,10}$/)]]
  });

  isEditModalVisible = false;
  editingPassengerIndex: number | null = null;
  editPassengerForm: FormGroup = this.fb.group({
    name: ['', Validators.required],
    passport: ['', [Validators.required, Validators.pattern(/^[A-Z0-9]{6,10}$/)]]
  });

  searchControl = this.fb.control('');
  searchTerm = signal('');

  filteredPassengers = computed(() => {
    const term = this.searchTerm().toLowerCase();
    return this.passengers().filter(p => p.name.toLowerCase().includes(term));
  });

  generateOccupiedSeats() {
    this.occupiedSeats = [];
    for (let r of this.seatRows) {
      for (let c of ['A', 'B', 'C', 'D', 'E', 'F']) {
        if (Math.random() < 0.3) {
          this.occupiedSeats.push(r + c);
        }
      }
    }
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
      'CDG': 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=800&h=400&fit=crop',
      'LHR': 'https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?w=800&h=400&fit=crop',
      'FCO': 'https://images.unsplash.com/photo-1552832230-c0197dd311b5?w=800&h=400&fit=crop',
      'BCN': 'https://images.unsplash.com/photo-1583422409516-2895a77efded?w=800&h=400&fit=crop',
      'MAD': 'https://images.unsplash.com/photo-1539037116277-4db20889f2d4?w=800&h=400&fit=crop',
      'OTP': 'https://images.unsplash.com/photo-1584646098378-0874589d76b1?w=800&h=400&fit=crop',
      'AMS': 'https://images.unsplash.com/photo-1512470876302-972faa2aa9a4?w=800&h=400&fit=crop',
      'ATH': 'https://images.unsplash.com/photo-1603565816030-6b389eeb23cb?w=800&h=400&fit=crop',
      'IST': 'https://images.unsplash.com/photo-1524231757912-21f4fe3a7200?w=800&h=400&fit=crop',
      'DUB': 'https://images.unsplash.com/photo-1605969353711-234dea348ce1?w=800&h=400&fit=crop',
      'GHV': 'https://images.unsplash.com/photo-1558253347-fb1128610003?w=800&h=400&fit=crop',
      'MUC': 'https://images.unsplash.com/photo-1595867818082-083862f3d630?w=800&h=400&fit=crop',
      'ZRH': 'https://images.unsplash.com/photo-1620563092215-0fbc6b55cfc5?w=800&h=400&fit=crop',
      'FRA': 'https://images.unsplash.com/photo-1494522855154-9297ac14b55f?w=800&h=400&fit=crop',
      'VIE': 'https://images.unsplash.com/photo-1516550893923-42d28e5677af?w=800&h=400&fit=crop',
      'CPH': 'https://images.unsplash.com/photo-1513622470522-26c3c8a854bc?w=800&h=400&fit=crop',
      'LIS': 'https://images.unsplash.com/photo-1585208798174-6cedd86e019a?w=800&h=400&fit=crop'
    };
    return urls[iata] || 'https://images.unsplash.com/photo-1436491865332-7a61a109cc05?w=800&h=400&fit=crop';
  }

  openSeatMap(index: number) {
    this.activePassengerIndex = index;
    this.selectedSeat = this.passengers()[index].seat || '';
    this.isSeatModalVisible = true;
  }

  handleSeatCancel() {
    this.isSeatModalVisible = false;
    this.activePassengerIndex = null;
    this.selectedSeat = '';
  }

  isSeatOccupied(seat: string): boolean {
    if (this.activePassengerIndex !== null && this.passengers()[this.activePassengerIndex].seat === seat) {
      return false;
    }
    if (this.passengers().some((p, i) => i !== this.activePassengerIndex && p.seat === seat)) {
      return true;
    }
    return this.occupiedSeats.includes(seat);
  }

  selectSeat(seat: string) {
    if (this.isSeatOccupied(seat)) return;
    this.selectedSeat = seat;
  }

  handleSeatSelect() {
    if (this.activePassengerIndex !== null && this.selectedSeat) {
      this.updateOption(this.activePassengerIndex, 'seat', this.selectedSeat);
    }
    this.isSeatModalVisible = false;
  }

  // Editing logic
  openEditModal(index: number) {
    this.editingPassengerIndex = index;
    const p = this.passengers()[index];
    this.editPassengerForm.patchValue({ name: p.name, passport: p.passport });
    this.isEditModalVisible = true;
  }

  handleEditCancel() {
    this.isEditModalVisible = false;
    this.editingPassengerIndex = null;
    this.editPassengerForm.reset();
  }

  handleEditPassenger() {
    if (this.editPassengerForm.invalid || this.editingPassengerIndex === null) return;
    const { name, passport } = this.editPassengerForm.value;
    
    this.passengers.update(p => {
      const updated = [...p];
      updated[this.editingPassengerIndex!] = { ...updated[this.editingPassengerIndex!], name, passport };
      return updated;
    });

    this.isEditModalVisible = false;
    this.editingPassengerIndex = null;
    this.editPassengerForm.reset();
    this.msg.success('Datele pasagerului au fost modificate.');
  }

  sortNameFn = (a: PassengerTicket, b: PassengerTicket) => a.name.localeCompare(b.name);
  sortPassportFn = (a: PassengerTicket, b: PassengerTicket) => a.passport.localeCompare(b.passport);
  sortClassFn = (a: PassengerTicket, b: PassengerTicket) => a.cabinClass.localeCompare(b.cabinClass);
  sortBaggageFn = (a: PassengerTicket, b: PassengerTicket) => a.baggage.localeCompare(b.baggage);
  sortSeatFn = (a: PassengerTicket, b: PassengerTicket) => (a.seat || '').localeCompare(b.seat || '');
  sortPriceFn = (a: PassengerTicket, b: PassengerTicket) => a.price - b.price;

  totalPrice = computed(() => {
    return this.passengers().reduce((sum, p) => sum + p.price, 0);
  });

  ngOnInit(): void {
    const flightId = this.route.snapshot.paramMap.get('flightId');
    if (flightId) {
      this.flightService.getFlightById(flightId).subscribe({
        next: (f) => {
          this.flight.set(f);
          this.generateOccupiedSeats();
        },
        error: () => {
          this.msg.error('Zborul nu a fost găsit!');
          this.router.navigate(['/feed']);
        }
      });
    }

    this.searchControl.valueChanges.subscribe(val => {
      this.searchTerm.set(val || '');
    });
  }

  showAddModal(): void {
    this.passengerForm.reset();
    this.isModalVisible = true;
  }

  handleCancel(): void {
    this.isModalVisible = false;
  }

  handleAddPassenger(): void {
    if (this.passengerForm.invalid) return;

    const basePrice = this.flight()?.basePrice || 0;
    const formVal = this.passengerForm.value;

    const newPassenger: PassengerTicket = {
      name: formVal.name,
      passport: formVal.passport,
      cabinClass: 'Economy',
      baggage: 'None',
      price: basePrice,
      seat: ''
    };

    this.passengers.update(p => [...p, newPassenger]);
    this.isModalVisible = false;
    this.msg.success('Pasager adăugat!');
  }

  removePassenger(index: number): void {
    this.passengers.update(p => p.filter((_, i) => i !== index));
    this.msg.info('Pasager șters din listă.');
  }

  updateOption(index: number, field: 'cabinClass' | 'baggage' | 'seat', value: any): void {
    this.passengers.update(p => {
      const updated = [...p];
      updated[index] = { ...updated[index], [field]: value };
      if (field !== 'seat') {
        updated[index].price = this.calculateTicketPrice(updated[index]);
      }
      return updated;
    });
  }

  private calculateTicketPrice(ticket: PassengerTicket): number {
    let price = this.flight()?.basePrice || 0;
    if (ticket.cabinClass === 'Business') price += 150;
    if (ticket.baggage === '10kg') price += 30;
    if (ticket.baggage === '23kg') price += 60;
    return price;
  }

  confirmPurchase(): void {
    if (this.passengers().some(p => !p.seat)) {
      this.msg.warning('Vă rugăm să selectați un loc pentru fiecare pasager!');
      return;
    }

    const f = this.flight();
    const user = this.authService.currentUser();
    const passList = this.passengers();

    if (!f || !user || passList.length === 0) return;

    this.isPurchasing.set(true);

    const booking: Booking = {
      userId: user.email, // using email as ID or generic user.id if present. We use email here for simplicity.
      flightId: f.id,
      flightDetails: {
        flightNumber: f.flightNumber,
        airline: f.airline,
        departureAirport: f.departureAirport,
        arrivalAirport: f.arrivalAirport,
        departureTime: f.departureTime
      },
      bookingDate: new Date().toISOString(),
      totalPrice: this.totalPrice(),
      passengers: passList
    };

    this.flightService.createBooking(booking).subscribe({
      next: () => {
        // Also add to Jurnal Personal automatically
        this.flightService.addFlightLog({
          userId: user.email as any,
          flightNumber: f.flightNumber,
          airline: f.airline,
          departureAirport: f.departureAirport,
          arrivalAirport: f.arrivalAirport,
          date: f.departureTime,
          status: 'Planificat',
          rating: 0
        }).subscribe();

        this.triggerConfetti();
        this.msg.success('Biletele au fost cumpărate cu succes!');
        setTimeout(() => {
          this.router.navigate(['/my-bookings']);
        }, 2000);
      },
      error: () => {
        this.msg.error('Eroare la cumpărarea biletelor!');
        this.isPurchasing.set(false);
      }
    });
  }

  private triggerConfetti(): void {
    confetti({
      particleCount: 150,
      spread: 80,
      origin: { y: 0.6 },
      colors: ['#ffd700', '#ff8c00', '#00bcd4']
    });
  }
}
