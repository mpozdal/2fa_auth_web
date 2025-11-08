import { Component, DestroyRef, inject, OnInit, signal } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { CommonModule } from '@angular/common';
import { NgOtpInputConfig, NgOtpInputModule } from 'ng-otp-input';
import {
  FormBuilder,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { NgOptimizedImage } from '@angular/common';
import { AuthService } from '../../services/auth-service';
import { LoginCredentials } from '../../models/auth.models';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { catchError, finalize } from 'rxjs';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MessageService } from 'primeng/api';
import { Toast } from 'primeng/toast';
import { MenuComponent } from '../../../../shared/components/menu/menu.components';
import { GoBackBackComponent } from '../../../../shared/components/back/back.component';
@Component({
  selector: 'app-login',
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
    RouterLink,
    MatProgressSpinnerModule,
    NgOtpInputModule,
    Toast,
    GoBackBackComponent,
  ],
  templateUrl: './login.html',
  styleUrl: './login.css',
  providers: [MessageService],
})
export class Login implements OnInit {
  protected loginForm!: FormGroup;
  protected twoFAForm!: FormGroup;

  protected readonly isLoading = signal(false);
  protected readonly is2FARequired = signal(false);

  private readonly destroyRef = inject(DestroyRef);
  private readonly fb = inject(FormBuilder);
  private readonly router = inject(Router);
  private readonly authService = inject(AuthService);
  private readonly messageService = inject(MessageService);

  protected readonly config: NgOtpInputConfig = {
    allowNumbersOnly: false,
    length: 6,
    isPasswordInput: false,
    disableAutoFocus: false,
  };

  ngOnInit(): void {
    this.twoFAForm = this.fb.group({
      code: ['', [Validators.required, Validators.minLength(6)]],
    });

    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(8)]],
    });
  }

  protected onOtpChange(event: string): void {
    if (event.length === 6) {
      this.on2FASubmit();
    }
  }

  protected on2FASubmit(): void {
    if (!this.twoFAForm.valid) {
      return;
    }

    this.isLoading.set(true);

    this.authService
      .verify2FA(this.twoFAForm.value.code)
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        finalize(() => this.isLoading.set(false))
      )
      .subscribe(() => {
        this.router.navigate(['/settings']);
      });
  }
  protected onSubmit(): void {
    if (!this.loginForm.valid) {
      return;
    }

    this.isLoading.set(true);

    const newLoginCredentials: LoginCredentials = {
      email: this.loginForm.value.email,
      password: this.loginForm.value.password,
    };

    this.authService
      .login(newLoginCredentials)
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        finalize(() => this.isLoading.set(false))
      )
      .subscribe((res) => {
        if (res.value.requiresTwoFactor) {
          this.is2FARequired.set(true);
        } else if (res.value.token) {
          this.router.navigate(['/settings']);
        }
      });
  }
}
