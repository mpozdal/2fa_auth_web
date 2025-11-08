// Twój istniejący plik 'security.ts'

import { Component, computed, DestroyRef, inject, OnInit, signal } from '@angular/core'; // Dodaj writableSignal
import { UserInfo, UserService } from './services/user.service';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { MatIconModule } from '@angular/material/icon'; // Dodaj MatIconModule
import { TwoFAService } from './services/two-fa.service'; // Załóżmy, że SetupResponse jest tutaj
import { switchMap, tap } from 'rxjs';
import { MatDialogModule } from '@angular/material/dialog';

// Importy dla rozwijanej karty
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { Clipboard, ClipboardModule } from '@angular/cdk/clipboard';
import { ReactiveFormsModule, FormControl, Validators, FormGroup } from '@angular/forms';
import { SetupResponse } from '../../../../shared/models/app.types';
import { NgOtpInputConfig, NgOtpInputModule } from 'ng-otp-input';
@Component({
  selector: 'app-security',
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatIconModule,
    MatDialogModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatSnackBarModule,
    ClipboardModule,
    NgOtpInputModule,
  ],
  templateUrl: './security.html',
  styleUrl: './security.css',
})
export class Security implements OnInit {
  private readonly userService = inject(UserService);
  private readonly twoFAService = inject(TwoFAService);
  private readonly destroyRef = inject(DestroyRef);
  private readonly clipboard = inject(Clipboard);
  private readonly snackBar = inject(MatSnackBar);

  protected readonly userInfo = signal<UserInfo | null>(null);
  protected readonly twoFactorEnabled = computed(() => !!this.userInfo()?.twoFactorEnabled);

  protected readonly isExpanded = signal<boolean>(false);
  protected readonly expansionStep = signal<1 | 2>(1);
  protected readonly qrCodeData = signal<string | null>(null);
  protected readonly manualEntryKey = signal<string | null>(null);

  public verificationCode = new FormControl('', [
    Validators.required,
    Validators.minLength(6),
    Validators.maxLength(6),
  ]);

  protected readonly config: NgOtpInputConfig = {
    allowNumbersOnly: false,
    length: 6,
    isPasswordInput: false,
    disableAutoFocus: false,
  };

  ngOnInit(): void {
    this.initUserInfo();
  }

  private initUserInfo(): void {
    this.userService
      .getUserInfo()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((res) => {
        this.userInfo.set(res);
      });
  }

  protected verifyTwoFactor(): void {
    this.twoFAService.enable(this.verificationCode.value ?? '').subscribe();
  }

  protected enableTwoFactor(): void {
    this.twoFAService
      .setup()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((res: SetupResponse) => {
        this.qrCodeData.set(res.qrCodeImageUrl);
        this.manualEntryKey.set(res.manualEntryKey);

        this.expansionStep.set(1);
        this.isExpanded.set(true);
      });
  }

  protected disableTwoFactor(): void {
    this.twoFAService
      .disable()
      .pipe(
        switchMap(() => this.userService.getUserInfo()),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe((userInfo) => {
        this.userInfo.set(userInfo);
        this.snackBar.open('2FA Disabled Successfully', 'Close', { duration: 2000 });
      });
  }

  protected submitVerification(): void {
    this.twoFAService
      .enable(this.verificationCode.value ?? '')
      .pipe(
        switchMap(() => this.userService.getUserInfo()),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe({
        next: (userInfo) => {
          this.snackBar.open('2FA Enabled Successfully!', 'Close', { duration: 2000 });
          this.userInfo.set(userInfo);
          this.isExpanded.set(false);
          this.verificationCode.reset();
        },
        error: (err) =>
          this.snackBar.open('Invalid code. Please try again.', 'Close', { duration: 3000 }),
      });
  }

  protected cancelExpansion(): void {
    this.isExpanded.set(false);
  }

  protected copyKeyToClipboard(): void {
    if (this.clipboard.copy(this.manualEntryKey()!)) {
      this.snackBar.open('Key copied to clipboard', 'Close', { duration: 2000 });
    }
  }
}
