import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { DashboardComponent } from './dashboard.component';
import { DashBoardRoutingModule } from './dashboard-routing.module';
import { ProjectBarComponent } from './project-table/project-bar/project-bar.component';
import { ProjectTableComponent } from './project-table/project-table.component';
import { DashMaterialModule } from './dashboard-material.module'
import { SideNavComponent } from './side-nav/side-nav.component';
import { UserManagementComponent } from './user-management/user-management.component';

@NgModule({
    declarations: [
        DashboardComponent,
        ProjectBarComponent,
        ProjectTableComponent,
        SideNavComponent,
        UserManagementComponent
    ],
    imports: [
        CommonModule,
        DashBoardRoutingModule,
        DashMaterialModule
    ]
})
export class DashboardModule{}
