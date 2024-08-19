import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { DashboardComponent } from './dashboard.component';
import { UserManagementComponent } from './user-management/user-management.component';

// Implement these routes when you get nested routing working

const routes: Routes = [
    {path: "users", component: UserManagementComponent},
    {path: "", component: DashboardComponent},
    {path: ":id", loadChildren: () => import('./project/project.module').then(m => m.ProjectModule) }
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
  })
export class DashBoardRoutingModule { }