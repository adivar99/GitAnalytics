import { NgModule } from '@angular/core';

import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatMenuModule } from '@angular/material/menu';
import { MatIconModule } from '@angular/material/icon';
import { MatSidenavModule } from '@angular/material/sidenav';

const modules = [
  MatCardModule,
  MatToolbarModule,
  MatButtonModule,
  MatFormFieldModule,
  MatMenuModule,
  MatIconModule,
  MatSidenavModule,
];

@NgModule({
  imports: modules,
  exports: modules,
})
export class MaterialModule {}
