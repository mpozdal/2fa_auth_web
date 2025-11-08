import { Component } from '@angular/core';
import { MenuComponent } from '../../shared/components/menu/menu.components';
import { MatTabsModule } from '@angular/material/tabs';
import { Security } from './components/security/security';
import { EmptyState } from "../../shared/components/empty-state/empty-state";

@Component({
  selector: 'app-settings',
  imports: [MenuComponent, MatTabsModule, Security, EmptyState],
  templateUrl: './settings.html',
  styleUrl: './settings.css',
})
export class Settings {}
