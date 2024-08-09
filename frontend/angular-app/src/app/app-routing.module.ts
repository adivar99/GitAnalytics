import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { LoginPageComponent } from './components/login-page/login-page.component';
import { DashboardModule } from './components/dashboard/dashboard.module';
import { LandingComponent } from './components/landing/landing.component';

const routes: Routes = [
  {path: "landing", component: LandingComponent},
  {path: "login", component: LoginPageComponent},
  {path: "dashboard", loadChildren: () => import('./components/dashboard/dashboard.module').then(m => m.DashboardModule)},
];

@NgModule({
  imports: [RouterModule.forRoot(routes, {useHash: true})],
  exports: [RouterModule]
})
export class AppRoutingModule { }
