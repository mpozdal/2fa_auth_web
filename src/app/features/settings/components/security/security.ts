import { Component, computed, DestroyRef, inject, OnInit, signal } from '@angular/core';
import { UserInfo, UserService } from './services/user.service';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { MatIconModule } from '@angular/material/icon';
import { TwoFAService } from './services/two-fa.service';
import { switchMap, tap } from 'rxjs';
import { MatDialogModule } from '@angular/material/dialog';

import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { Clipboard, ClipboardModule } from '@angular/cdk/clipboard';
import { ReactiveFormsModule, FormControl, Validators } from '@angular/forms';
import { Enable2FAResponse, SetupResponse } from '../../../../shared/models/app.types';
import { NgOtpInputConfig, NgOtpInputModule } from 'ng-otp-input';
import { MessageService } from 'primeng/api';
import { Toast } from "primeng/toast";
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
    ClipboardModule,
    NgOtpInputModule,
    Toast
],
  templateUrl: './security.html',
  styleUrl: './security.css',
  providers: [MessageService],
})
export class Security implements OnInit {
  private readonly userService = inject(UserService);
  private readonly twoFAService = inject(TwoFAService);
  private readonly destroyRef = inject(DestroyRef);
  private readonly clipboard = inject(Clipboard);
  private readonly messageService = inject(MessageService);

  protected readonly userInfo = signal<UserInfo | null>(null);

  protected readonly recoveryCodes = signal<string[]>([]);
  protected readonly isExpanded = signal<boolean>(false);
  protected readonly expansionStep = signal<1 | 2 | 3>(1);
  protected readonly qrCodeData = signal<string | null>(null);
  protected readonly manualEntryKey = signal<string | null>(null);

  protected readonly twoFactorEnabled = computed(() => !!this.userInfo()?.twoFactorEnabled);

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

  protected onOtpChange(event: string): void {
    if (event.length === 6) {
      this.submitVerification();
    }
  }

  private initUserInfo(): void {
    this.userService
      .getUserInfo()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((res) => {
        this.userInfo.set(res);
      });
  }
  protected finishSetup(): void {
    this.isExpanded.set(false);
    this.recoveryCodes.set([]);
  }

  protected copyCodesToClipboard(): void {
    const codesString = this.recoveryCodes().join('\n');
    if (this.clipboard.copy(codesString)) {
      this.messageService.add({
        severity: 'info',
        summary: 'Info',
        detail: 'Recovery codes copied to clipboard',
      });
    }
  }

  protected downloadCodesAsTxt(): void {
    const codesString = this.recoveryCodes().join('\n');
    const blob = new Blob([codesString], { type: 'text/plain;charset=utf-8' });
    const url = window.URL.createObjectURL(blob);

    const a = document.createElement('a');
    a.href = url;
    a.download = 'my-recovery-codes.txt';
    document.body.appendChild(a);
    a.click();

    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
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
    this.finishSetup();
    this.twoFAService
      .disable()
      .pipe(
        switchMap(() => this.userService.getUserInfo()),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe((userInfo) => {
        this.userInfo.set(userInfo);
        this.messageService.add({
          severity: 'success',
          summary: 'Success',
          detail: '2FA Disabled Successfully!',
        });
      });
  }

  protected submitVerification(): void {
    this.twoFAService
      .enable(this.verificationCode.value ?? '')
      .pipe(
        tap((res: Enable2FAResponse) => {
          this.recoveryCodes.set(res.recoveryCodes);
        }),
        switchMap(() => this.userService.getUserInfo()),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe({
        next: (userInfo) => {
          this.messageService.add({
            severity: 'success',
            summary: 'Success',
            detail: '2FA Enabled Successfully!',
          });
          this.userInfo.set(userInfo);
          this.expansionStep.set(3);
          this.verificationCode.reset();
        },
        error: (err) => {
          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: 'Invalid code. Please try again!',
          });
        },
      });
  }

  protected cancelExpansion(): void {
    this.isExpanded.set(false);
  }

  protected copyKeyToClipboard(): void {
    if (this.clipboard.copy(this.manualEntryKey()!)) {
      this.messageService.add({
        severity: 'info',
        summary: 'Info',
        detail: 'Key copied to clipboard',
      });
    }
  }
}
