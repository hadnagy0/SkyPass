import { Routes } from '@angular/router';
import { authGuard, noAuthGuard } from './core/guards/auth.guard';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'feed',
    pathMatch: 'full'
  },
  {
    path: 'login',
    loadComponent: () => import('./features/auth/login/login.component').then(m => m.LoginComponent),
    canActivate: [noAuthGuard]
  },
  {
    path: 'register',
    loadComponent: () => import('./features/auth/register/register.component').then(m => m.RegisterComponent),
    canActivate: [noAuthGuard]
  },
  {
    path: 'feed',
    loadComponent: () => import('./features/flight-feed/flight-feed.component').then(m => m.FlightFeedComponent),
    canActivate: [authGuard]
  },
  {
    path: 'checkout/:flightId',
    loadComponent: () => import('./features/checkout/checkout.component').then(m => m.CheckoutComponent),
    canActivate: [authGuard]
  },
  {
    path: 'my-bookings',
    loadComponent: () => import('./features/my-bookings/my-bookings.component').then(m => m.MyBookingsComponent),
    canActivate: [authGuard]
  },
  {
    path: 'contact',
    loadComponent: () => import('./features/contact/contact.component').then(m => m.ContactComponent),
    canActivate: [authGuard]
  },
  {
    path: 'airlines',
    loadComponent: () => import('./features/airlines/airlines.component').then(m => m.AirlinesComponent),
    canActivate: [authGuard]
  },
  {
    path: '**',
    redirectTo: 'feed'
  }
];
