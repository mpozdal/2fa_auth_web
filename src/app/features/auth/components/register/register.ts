import { CommonModule, NgOptimizedImage } from '@angular/common';
import { Component, DestroyRef, inject, signal } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
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
import { finalize, tap } from 'rxjs';

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
  ],
  templateUrl: './register.html',
  styleUrl: '../login/login.css',
})
export class Register {
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);
  private readonly destroyRef = inject(DestroyRef);
  private readonly fb = inject(FormBuilder);

  protected loginForm!: FormGroup;
  protected isLoading = signal(false);

  ngOnInit(): void {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(8)]],
      rePassword: ['', [Validators.required]],
    });
  }

  onSubmit(): void {
    this.authService
      .register(this.loginForm.value)
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        tap(() => this.isLoading.set(true)),
        finalize(() => this.isLoading.set(false))
      )
      .subscribe((res) => {
        this.loginForm.reset();
        this.router.navigate(['/login']);
      });
  }
}
