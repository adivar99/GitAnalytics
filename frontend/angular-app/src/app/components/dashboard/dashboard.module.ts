import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { DashboardComponent } from './dashboard.component';
import { DashBoardRoutingModule } from './dashboard-routing.module';
import { ProjectBarComponent } from './project-table/project-bar/project-bar.component';
import { ProjectTableComponent } from './project-table/project-table.component';
import { DashMaterialModule } from './dashboard-material.module'
import { UserManagementComponent } from './user-management/user-management.component';

@NgModule({
    declarations: [
        DashboardComponent,
        ProjectBarComponent,
        ProjectTableComponent,
        UserManagementComponent,
    ],
    imports: [
        CommonModule,
        DashBoardRoutingModule,
        DashMaterialModule,
        FormsModule,
    ]
})
export class DashboardModule{}
