import { Component, inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, AbstractControl, ValidationErrors } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { passwordStrengthValidator } from '../../../shared/validators/password-strength.validator';
import { NzFormModule } from 'ng-zorro-antd/form';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzMessageService } from 'ng-zorro-antd/message';

// Validator local pentru confirmarea parolei
const passwordMatchValidator = (control: AbstractControl): ValidationErrors | null => {
  const password = control.get('password')?.value;
  const confirmPassword = control.get('confirmPassword')?.value;
  
  if (!password || !confirmPassword) {
    return null;
  }
  
  return password === confirmPassword ? null : { passwordMismatch: true };
};

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    RouterLink,
    NzFormModule,
    NzInputModule,
    NzButtonModule
  ],
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css']
})
export class RegisterComponent {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private router = inject(Router);
  private message = inject(NzMessageService);

  registerForm: FormGroup = this.fb.group({
    nume: ['', [Validators.required, Validators.minLength(2)]],
    prenume: ['', [Validators.required, Validators.minLength(2)]],
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, passwordStrengthValidator()]],
    confirmPassword: ['', [Validators.required]]
  }, { validators: passwordMatchValidator });

  isLoading = false;

  submitForm(): void {
    if (this.registerForm.valid) {
      this.isLoading = true;
      const { email, password } = this.registerForm.value;

      this.authService.register(email, password).subscribe({
        next: (response) => {
          setTimeout(() => {
            this.isLoading = false;
            this.message.success('Cont creat cu succes! Te poți conecta acum.');
            this.router.navigate(['/login']);
          });
        },
        error: (err) => {
          setTimeout(() => {
            this.isLoading = false;
            this.message.error(err.error?.error || 'Eroare la înregistrare! (Notă: ReqRes necesită conturi pre-definite precum eve.holt@reqres.in)');
          });
        }
      });
    } else {
      Object.values(this.registerForm.controls).forEach(control => {
        if (control.invalid) {
          control.markAsDirty();
          control.updateValueAndValidity({ onlySelf: true });
        }
      });
    }
  }

  // Helperi pentru erori specifice parolei custom
  getPasswordErrorTip(): string {
    const errors = this.registerForm.get('password')?.errors?.['passwordStrength'];
    if (!errors) return 'Te rugăm să introduci parola!';
    
    const messages = [];
    if (!errors.isValidLength) messages.push('min. 6 caractere');
    if (!errors.hasUpperCase) messages.push('o literă mare');
    if (!errors.hasLowerCase) messages.push('o literă mică');
    if (!errors.hasNumeric) messages.push('o cifră');
    if (!errors.hasSpecialChar) messages.push('un caracter special');
    
    return `Parola trebuie să conțină: ${messages.join(', ')}`;
  }
}
