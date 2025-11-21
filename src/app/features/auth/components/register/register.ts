import { CommonModule, NgOptimizedImage } from '@angular/common';
import { Component, DestroyRef, inject, signal } from '@angular/core';
import {
  AbstractControl,
  FormBuilder,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  ValidationErrors,
  Validators,
} from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { Router, RouterLink } from '@angular/router';
import { GoBackBackComponent } from '../../../../shared/components/back/back.component';
import { MatProgressSpinner } from '@angular/material/progress-spinner';
import { AuthService } from '../../services/auth-service';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { catchError, EMPTY, finalize, tap } from 'rxjs';
import { MessageService } from 'primeng/api';
import { Toast } from 'primeng/toast';

@Component({
  selector: 'app-register',
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    NgOptimizedImage,
    GoBackBackComponent,
    MatProgressSpinner,
    RouterLink,
    Toast,
  ],
  templateUrl: './register.html',
  styleUrl: '../login/login.css',
  providers: [MessageService],
})
export class Register {
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);
  private readonly destroyRef = inject(DestroyRef);
  private readonly fb = inject(FormBuilder);
  private readonly messageService = inject(MessageService);

  protected loginForm!: FormGroup;
  protected isLoading = signal(false);

  ngOnInit(): void {
    this.loginForm = this.fb.group(
      {
        email: ['', [Validators.required, Validators.email]],
        password: [
          '',
          [
            Validators.required,
            Validators.minLength(8),
            Validators.pattern(/^(?=.*\d)(?=.*[!@#$%^&*]).*$/),
          ],
        ],
        rePassword: ['', [Validators.required]],
      },
      {
        validators: this.passwordMatchValidator,
      }
    );
  }

  private passwordMatchValidator(control: AbstractControl): ValidationErrors | null {
    const password = control.get('password')?.value;
    const rePassword = control.get('rePassword')?.value;

    if (password && rePassword && password !== rePassword) {
      control.get('rePassword')?.setErrors({ mismatch: true });
      return { mismatch: true };
    } else {
      const rePasswordControl = control.get('rePassword');
      if (rePasswordControl?.hasError('mismatch')) {
        rePasswordControl.setErrors(null);
      }
      return null;
    }
  }

  onSubmit(): void {
    if (this.loginForm.invalid) {
      return;
    }

    this.authService
      .register(this.loginForm.value)
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        tap(() => this.isLoading.set(true)),
        finalize(() => this.isLoading.set(false)),
        catchError((error: unknown) => {
          this.messageService.add({
            severity: 'error',
            summary: 'Registration Failed',
            detail: 'Unable to create account. Please try again later.',
          });

          return EMPTY;
        })
      )
      .subscribe((res) => {
        this.messageService.add({
          severity: 'success',
          summary: 'Success',
          detail: 'Account created successfully! You can now log in.',
        });
        this.loginForm.reset();
        this.router.navigate(['/login']);
      });
  }
}
