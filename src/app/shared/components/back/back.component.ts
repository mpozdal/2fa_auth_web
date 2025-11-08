import { Component, inject } from '@angular/core';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { CommonModule, Location } from '@angular/common';
import { AuthService } from '../../../features/auth/services/auth-service';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-go-back',
  standalone: true,
  imports: [CommonModule, MatIconModule],
  styleUrl: './back.component.css',
  template: `
    <div class="back-container">
      <a class="back" (click)="onClick()"> <mat-icon matSuffix>arrow_back_ios</mat-icon>Go Back</a>
    </div>
  `,
})
export class GoBackBackComponent {
  private location = inject(Location);

  onClick(): void {
    this.location.back();
  }
}
