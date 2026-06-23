import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { NzTabsModule } from 'ng-zorro-antd/tabs';
import { NzTableModule } from 'ng-zorro-antd/table';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzModalModule } from 'ng-zorro-antd/modal';
import { NzFormModule } from 'ng-zorro-antd/form';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzSelectModule } from 'ng-zorro-antd/select';
import { NzPopconfirmModule } from 'ng-zorro-antd/popconfirm';
import { NzCardModule } from 'ng-zorro-antd/card';
import { NzRateModule } from 'ng-zorro-antd/rate';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzDatePickerModule } from 'ng-zorro-antd/date-picker';
import { FlightService } from '../../core/services/flight.service';
import { AuthService } from '../../core/services/auth.service';
import { Booking, FlightLog } from '../../core/models/flight.model';
import { jsPDF } from 'jspdf';
import * as QRCode from 'qrcode';
import { AIRLINE_LOGOS } from '../../core/utils/logos';

@Component({
  selector: 'app-my-bookings',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    NzTabsModule,
    NzTableModule,
    NzButtonModule,
    NzIconModule,
    NzModalModule,
    NzFormModule,
    NzInputModule,
    NzSelectModule,
    NzPopconfirmModule,
    NzCardModule,
    NzRateModule,
    NzDatePickerModule
  ],
  template: `
    <div class="bookings-container">
      <h2 class="page-title">Panoul Meu de Călătorii</h2>

      <nz-tabs>
        <!-- Tab 1: Rezervări Active -->
        <nz-tab nzTitle="Biletele Mele Cumpărate">
          <div class="booking-list">
            <nz-card *ngFor="let b of myBookings()" class="glass-card mb-4">
              <div class="booking-header">
                <div>
                  <h3 class="airline-cell">
                    Zbor {{ b.flightDetails.flightNumber }} - 
                    <img [src]="getLogoUrl(b.flightDetails.airline)" alt="Logo" class="airline-logo-small" onerror="this.style.display='none'" />
                    {{ b.flightDetails.airline }}
                  </h3>
                  <p>{{ b.flightDetails.departureAirport }} -> {{ b.flightDetails.arrivalAirport }}</p>
                  <p>Data Rezervării: {{ b.bookingDate | date:'medium' }} | Total: €{{ b.totalPrice }}</p>
                </div>
                <button nz-button nzType="primary" (click)="downloadPDF(b)">
                  <span nz-icon nzType="download"></span> Descarcă Bilet PDF
                </button>
              </div>
              <nz-table #pTable [nzData]="b.passengers" [nzFrontPagination]="false" [nzShowPagination]="false" nzSize="small">
                <thead>
                  <tr>
                    <th>Pasager</th>
                    <th>Pașaport</th>
                    <th>Loc</th>
                    <th>Clasa</th>
                    <th>Bagaj</th>
                  </tr>
                </thead>
                <tbody>
                  <tr *ngFor="let p of pTable.data">
                    <td>{{ p.name }}</td>
                    <td>{{ p.passport }}</td>
                    <td><strong>{{ p.seat }}</strong></td>
                    <td>{{ p.cabinClass }}</td>
                    <td>{{ p.baggage }}</td>
                  </tr>
                </tbody>
              </nz-table>
            </nz-card>
            <div *ngIf="myBookings().length === 0" class="empty-state">
              Nu ai nicio rezervare momentan.
            </div>
          </div>
        </nz-tab>

        <!-- Tab 2: Jurnal Personal (CRUD) -->
        <nz-tab nzTitle="Istoric Zboruri">
          <nz-card class="glass-card">
            <div class="log-toolbar">
              <nz-input-group [nzPrefix]="searchIcon" class="search-bar">
                <input type="text" nz-input placeholder="Caută zbor..." [formControl]="searchControl" />
              </nz-input-group>
              <ng-template #searchIcon><span nz-icon nzType="search"></span></ng-template>
            </div>

            <nz-table #logTable [nzData]="filteredLogs()">
              <thead>
                <tr>
                  <th nzColumnKey="flightNumber" [nzSortFn]="sortFn('flightNumber')">Nr. Zbor</th>
                  <th nzColumnKey="airline" [nzSortFn]="sortFn('airline')">Companie</th>
                  <th>Rută</th>
                  <th nzColumnKey="date" [nzSortFn]="sortFn('date')">Data</th>
                  <th nzColumnKey="status" [nzSortFn]="sortFn('status')">Status</th>
                  <th nzColumnKey="rating" [nzSortFn]="sortFn('rating')">Rating</th>
                  <th>Acțiuni</th>
                </tr>
              </thead>
              <tbody>
                <tr *ngFor="let log of logTable.data">
                  <td>{{ log.flightDetails.flightNumber }}</td>
                  <td>
                    <div class="airline-cell">
                      <img [src]="getLogoUrl(log.flightDetails.airline)" alt="Logo" class="airline-logo-small" onerror="this.style.display='none'" />
                      {{ log.flightDetails.airline }}
                    </div>
                  </td>
                  <td>{{ log.flightDetails.departureAirport }} -> {{ log.flightDetails.arrivalAirport }}</td>
                  <td>{{ log.flightDetails.departureTime | date:'shortDate' }}</td>
                  <td>
                    <span class="status-badge" [ngClass]="(log.status || 'Efectuat').toLowerCase()">{{ log.status || 'Efectuat' }}</span>
                  </td>
                  <td><nz-rate [ngModel]="log.rating || 0" nzDisabled></nz-rate></td>
                  <td>
                    <button nz-button nzType="text" nzSize="small" (click)="editLog(log)">
                      <span nz-icon nzType="star"></span> Evaluează
                    </button>
                  </td>
                </tr>
              </tbody>
            </nz-table>
          </nz-card>
        </nz-tab>
      </nz-tabs>

      <!-- Modal Istoric -->
      <nz-modal [(nzVisible)]="isModalVisible" nzTitle="Evaluează Zborul" (nzOnCancel)="handleCancel()" (nzOnOk)="handleSaveLog()">
        <ng-container *nzModalContent>
          <form nz-form [formGroup]="logForm">
            <nz-form-item>
              <nz-form-label [nzSm]="8">Acordă un Rating</nz-form-label>
              <nz-form-control [nzSm]="16">
                <nz-rate formControlName="rating"></nz-rate>
              </nz-form-control>
            </nz-form-item>
          </form>
        </ng-container>
      </nz-modal>
    </div>
  `,
  styles: [`
    .bookings-container {
      max-width: 1200px;
      margin: 2rem auto;
      padding: 0 1rem;
    }
    .page-title {
      text-align: center;
      color: #fff;
      font-size: 2.5rem;
      margin-bottom: 2rem;
    }
    .airline-cell {
      display: flex;
      align-items: center;
      gap: 8px;
    }
    .airline-logo-small {
      width: 24px;
      height: 24px;
      border-radius: 50%;
      background: #fff;
      padding: 2px;
      object-fit: contain;
    }
    .glass-card {
      background: rgba(10, 25, 47, 0.85);
      backdrop-filter: blur(10px);
      border: 1px solid rgba(255, 255, 255, 0.1);
      border-radius: 12px;
      color: #fff;
    }
    .booking-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-bottom: 1rem;
      border-bottom: 1px solid rgba(255,255,255,0.1);
      padding-bottom: 1rem;
    }
    .booking-header h3 { color: #ffd700; margin-bottom: 0.5rem; }
    .booking-header p { margin: 0; color: #ccc; }
    .log-toolbar {
      display: flex;
      justify-content: space-between;
      margin-bottom: 1.5rem;
    }
    .search-bar {
      max-width: 300px;
    }
    .status-badge {
      padding: 4px 8px;
      border-radius: 4px;
      font-size: 0.85rem;
      font-weight: bold;
    }
    .status-badge.efectuat { background: rgba(0, 255, 0, 0.2); color: #0f0; }
    .status-badge.planificat { background: rgba(255, 165, 0, 0.2); color: orange; }
    .status-badge.anulat { background: rgba(255, 0, 0, 0.2); color: #f00; }
    .empty-state { text-align: center; padding: 2rem; color: #aaa; }
    .mb-4 { margin-bottom: 1.5rem; }
    ::ng-deep .ant-tabs-tab { color: #ccc; }
    ::ng-deep .ant-tabs-tab-active { color: #fff !important; font-weight: bold; }
    ::ng-deep .ant-table { background: transparent !important; color: #fff !important; }
    ::ng-deep .ant-table-thead > tr > th { background: rgba(255, 255, 255, 0.1) !important; color: #fff !important; }
    ::ng-deep .ant-table-tbody > tr > td { border-bottom: 1px solid rgba(255, 255, 255, 0.1); }
    ::ng-deep .ant-table-tbody > tr:hover > td { background: rgba(255, 255, 255, 0.05) !important; }
    ::ng-deep .ant-modal-content { background: #1f2937 !important; color: #fff; }
    ::ng-deep .ant-modal-header { background: #1f2937 !important; border-bottom: 1px solid #374151; }
    ::ng-deep .ant-modal-title { color: #fff !important; }
  `]
})
export class MyBookingsComponent implements OnInit {
  private flightService = inject(FlightService);
  private authService = inject(AuthService);
  private fb = inject(FormBuilder);
  private msg = inject(NzMessageService);

  allMyBookings = signal<Booking[]>([]);
  myBookings = computed(() => {
    const now = new Date().getTime();
    return this.allMyBookings().filter(b => new Date(b.flightDetails.departureTime).getTime() >= now);
  });
  pastBookings = computed(() => {
    const now = new Date().getTime();
    return this.allMyBookings().filter(b => new Date(b.flightDetails.departureTime).getTime() < now);
  });

  searchControl = this.fb.control('');
  searchTerm = signal('');

  isModalVisible = false;
  editingBooking: Booking | null = null;

  logForm: FormGroup = this.fb.group({
    rating: [0]
  });

  filteredLogs = computed(() => {
    const term = this.searchTerm().toLowerCase();
    return this.pastBookings()
      .filter(log =>
        log.flightDetails.flightNumber.toLowerCase().includes(term) ||
        log.flightDetails.airline.toLowerCase().includes(term) ||
        log.flightDetails.departureAirport.toLowerCase().includes(term) ||
        log.flightDetails.arrivalAirport.toLowerCase().includes(term)
      )
      .sort((a, b) => {
        const d1 = new Date(a.flightDetails.departureTime).getTime();
        const d2 = new Date(b.flightDetails.departureTime).getTime();
        return d1 - d2;
      });
  });

  ngOnInit(): void {
    this.loadData();
    this.searchControl.valueChanges.subscribe(val => {
      this.searchTerm.set(val || '');
    });
  }

  loadData(): void {
    const user = this.authService.currentUser();
    if (!user) return;

    this.flightService.getBookings().subscribe({
      next: (allBookings) => {
        this.allMyBookings.set(allBookings.filter(b => b.userId === user.email));
      }
    });
  }

  sortFn(key: string): (a: Booking, b: Booking) => number {
    return (a: Booking, b: Booking) => {
      let valA: any = '';
      let valB: any = '';
      if (key === 'flightNumber') { valA = a.flightDetails.flightNumber; valB = b.flightDetails.flightNumber; }
      else if (key === 'airline') { valA = a.flightDetails.airline; valB = b.flightDetails.airline; }
      else if (key === 'date') { valA = new Date(a.flightDetails.departureTime).getTime(); valB = new Date(b.flightDetails.departureTime).getTime(); }
      else if (key === 'status') { valA = a.status || 'Efectuat'; valB = b.status || 'Efectuat'; }
      else if (key === 'rating') { valA = a.rating || 0; valB = b.rating || 0; }

      if (valA < valB) return -1;
      if (valA > valB) return 1;
      return 0;
    };
  }

  editLog(log: Booking): void {
    this.editingBooking = log;
    this.logForm.patchValue({
      rating: log.rating || 0
    });
    this.isModalVisible = true;
  }

  handleCancel(): void {
    this.isModalVisible = false;
  }

  handleSaveLog(): void {
    if (!this.editingBooking || !this.editingBooking.id) return;

    const updatedBooking = {
      ...this.editingBooking,
      rating: this.logForm.value.rating
    };

    this.flightService.updateBooking(this.editingBooking.id, updatedBooking).subscribe(() => {
      this.msg.success('Rating actualizat cu succes!');
      this.loadData();
      this.isModalVisible = false;
    });
  }

  async downloadPDF(booking: Booking): Promise<void> {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    let yPos = 20;

    doc.setFillColor(15, 32, 39);
    doc.rect(0, 0, pageWidth, 40, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(22);
    doc.text('SKYPASS TICKET', pageWidth / 2, 25, { align: 'center' });

    doc.setTextColor(0, 0, 0);
    doc.setFontSize(14);
    yPos = 60;
    
    doc.text(`Booking Ref: ${booking.id || 'N/A'}`, 20, yPos);
    doc.text(`Date: ${new Date(booking.bookingDate).toLocaleDateString()}`, pageWidth - 20, yPos, { align: 'right' });
    yPos += 20;

    doc.setFontSize(16);
    doc.text(`Flight ${booking.flightDetails.flightNumber} - ${booking.flightDetails.airline}`, 20, yPos);
    
    // Add Airline Logo to PDF
    const base64Logo = this.getLogoUrl(booking.flightDetails.airline);
    if (base64Logo && base64Logo.startsWith('data:image')) {
      doc.addImage(base64Logo, 'PNG', pageWidth - 45, yPos - 10, 25, 25);
    }
    
    yPos += 10;
    doc.setFontSize(12);
    doc.text(`${booking.flightDetails.departureAirport} -> ${booking.flightDetails.arrivalAirport}`, 20, yPos);
    doc.text(`Departure: ${booking.flightDetails.departureTime}`, 20, yPos + 10);
    yPos += 30;

    for (const p of booking.passengers) {
      if (yPos > 250) {
        doc.addPage();
        yPos = 30;
      }
      doc.setDrawColor(200);
      doc.setFillColor(245, 245, 245);
      doc.roundedRect(20, yPos, pageWidth - 40, 50, 3, 3, 'FD');
      
      doc.setFontSize(14);
      doc.text(`Passenger: ${p.name}`, 25, yPos + 15);
      doc.setFontSize(11);
      doc.text(`Passport: ${p.passport} | Seat: ${p.seat}`, 25, yPos + 30);
      doc.text(`Class: ${p.cabinClass} | Baggage: ${p.baggage}`, 25, yPos + 40);
      
      // Real QR Code
      const qrData = `TICKET|${booking.id}|${booking.flightDetails.flightNumber}|${p.name}|${p.passport}|${p.seat}`;
      try {
        const qrDataUrl = await QRCode.toDataURL(qrData, { margin: 1, width: 64 });
        doc.addImage(qrDataUrl, 'PNG', pageWidth - 55, yPos + 8, 34, 34);
      } catch (err) {
        console.error('Eroare la generarea QR Code-ului', err);
      }

      yPos += 60;
    }

    // SkyPass Secure Network Stamp
    if (yPos > 240) {
      doc.addPage();
      yPos = 30;
    } else {
      yPos += 20;
    }

    const centerX = pageWidth / 2;
    const centerY = yPos + 30;
    
    // Draw dotted circle
    doc.setDrawColor(0, 242, 254);
    doc.setLineWidth(0.5);
    doc.setLineDashPattern([2, 2], 0);
    doc.circle(centerX, centerY, 25, 'S');
    doc.setLineDashPattern([], 0); // reset

    // Draw text around circle
    doc.setFontSize(8);
    doc.setTextColor(100);
    const stampText = " • ISSUED BY SKYPASS SECURE NETWORK";
    const radius = 27;
    const angleStep = (Math.PI * 2) / stampText.length;

    for (let i = 0; i < stampText.length; i++) {
      const char = stampText[i];
      const angle = i * angleStep - Math.PI / 2;
      const x = centerX + Math.cos(angle) * radius;
      const y = centerY + Math.sin(angle) * radius;
      // Rotate text by angle + 90 degrees
      doc.text(char, x, y, { angle: (angle + Math.PI / 2) * (180 / Math.PI), align: 'center' } as any);
    }

    // Attempt to load and add the S logo inside
    try {
      const img = new Image();
      img.src = 'assets/logo.png';
      await new Promise((resolve) => {
        img.onload = resolve;
        img.onerror = resolve; // Ignore error if it doesn't load
      });
      const canvas = document.createElement('canvas');
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(img, 0, 0);
        const base64SLogo = canvas.toDataURL('image/png');
        doc.addImage(base64SLogo, 'PNG', centerX - 12, centerY - 12, 24, 24);
      }
    } catch (e) {
      console.error(e);
    }

    doc.save(`SkyPass_Ticket_${booking.flightDetails.flightNumber}.pdf`);
  }

  getLogoUrl(airline: string): string {
    if (!airline) return '';
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
