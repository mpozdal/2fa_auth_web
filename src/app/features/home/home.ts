import { Component, inject } from '@angular/core';
import { AuthService } from '../auth/services/auth-service';
import { Router } from '@angular/router';
import { NgOptimizedImage } from '@angular/common';
import { MenuComponent } from '../../shared/components/menu/menu.components';

@Component({
  selector: 'app-home',
  imports: [NgOptimizedImage, MenuComponent],
  templateUrl: './home.html',
  styleUrl: './home.css',
})
export class Home {}
