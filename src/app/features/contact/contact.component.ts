import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NzCardModule } from 'ng-zorro-antd/card';
import { NzIconModule } from 'ng-zorro-antd/icon';

@Component({
  selector: 'app-contact',
  standalone: true,
  imports: [CommonModule, NzCardModule, NzIconModule],
  template: `
    <div class="contact-container">
      <div class="contact-content">
        <img src="/assets/logo.png" alt="SkyPass Logo" class="contact-logo" />
        <h1 class="contact-title">SkyPass</h1>
        <p class="contact-motto">"Your boarding pass to everywhere."</p>

        <nz-card class="glass-card contact-card">
          <h2>Informații de Contact</h2>
          <div class="contact-details">
            <p><span nz-icon nzType="mail"></span> <strong>Email:</strong> support@skypass.com</p>
            <p><span nz-icon nzType="phone"></span> <strong>Telefon:</strong> +40 000 000 000</p>
            <p><span nz-icon nzType="environment"></span> <strong>Adresa:</strong> Strada Aviației, Nr. 1, București, România</p>
          </div>
          <p class="contact-footer-text">Echipa noastră îți stă la dispoziție 24/7 pentru orice nelămuriri legate de zborurile tale.</p>
        </nz-card>
      </div>
    </div>
  `,
  styles: [`
    .contact-container {
      display: flex;
      justify-content: center;
      align-items: center;
      min-height: calc(100vh - 120px);
      padding: 2rem;
      text-align: center;
    }
    .contact-content {
      max-width: 600px;
      width: 100%;
    }
    .contact-logo {
      height: 120px;
      margin-bottom: 1rem;
      filter: drop-shadow(0 0 20px rgba(0, 242, 254, 0.4));
      animation: float 3s ease-in-out infinite;
    }
    .contact-title {
      font-size: 3rem;
      color: #fff;
      margin-bottom: 0.5rem;
    }
    .contact-motto {
      font-size: 1.5rem;
      color: #00F2FE;
      margin-bottom: 3rem;
      font-style: italic;
      font-weight: 300;
    }
    .contact-card {
      text-align: left;
      padding: 2rem;
    }
    .contact-card h2 {
      color: #fff;
      font-size: 1.8rem;
      margin-bottom: 2rem;
      border-bottom: 1px solid rgba(255, 255, 255, 0.2);
      padding-bottom: 0.5rem;
    }
    .contact-details p {
      font-size: 1.2rem;
      color: #cbd5e0;
      margin-bottom: 1.5rem;
      display: flex;
      align-items: center;
    }
    .contact-details p span[nz-icon] {
      font-size: 1.5rem;
      color: #00F2FE;
      margin-right: 15px;
    }
    .contact-details strong {
      color: #fff;
      margin-right: 10px;
    }
    .contact-footer-text {
      margin-top: 2rem;
      font-size: 0.95rem;
      color: #a0aec0;
      text-align: center;
    }
    @keyframes float {
      0% { transform: translateY(0px); }
      50% { transform: translateY(-10px); }
      100% { transform: translateY(0px); }
    }
  `]
})
export class ContactComponent {}
