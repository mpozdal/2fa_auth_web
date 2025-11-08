import { Routes } from '@angular/router';
import { Login } from './features/auth/components/login/login';
import { Register } from './features/auth/components/register/register';
import { Home } from './features/home/home';
import { authGuard } from './features/auth/guards/auth-guard';
import { publicGuard } from './features/auth/guards/public-guard';
import { Settings } from './features/settings/settings';

export const routes: Routes = [
  {
    path: 'login',
    component: Login,
    canActivate: [publicGuard],
  },
  {
    path: 'register',
    component: Register,
    canActivate: [publicGuard],
  },
  {
    path: '',
    component: Home,
  },
  {
    path: 'settings',
    component: Settings,
    canActivate: [authGuard],
  },
];
