import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { DashboardComponent } from './dashboard.component';
import { UserManagementComponent } from './user-management/user-management.component';
import { ProjectTableComponent } from './project-table/project-table.component';

// Implement these routes when you get nested routing working
// {path: "users", component: UserManagementComponent, outlet: "dash"},
// {path: "", component: ProjectTableComponent, outlet: "dash"},

const routes: Routes = [
    {path: "", component: DashboardComponent}
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
  })
export class DashBoardRoutingModule { }