import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { DashboardComponent } from './dashboard.component';
import { DashBoardRoutingModule } from './dashboard-routing.module';
import { ProjectBarComponent } from './project-table/project-bar/project-bar.component';
import { ProjectTableComponent } from './project-table/project-table.component';
import { DashMaterialModule } from './dash-material.module'

@NgModule({
    declarations: [
        DashboardComponent,
        ProjectBarComponent,
        ProjectTableComponent
    ],
    imports: [
        CommonModule,
        DashBoardRoutingModule,
        DashMaterialModule
    ]
})
export class DashboardModule{}
