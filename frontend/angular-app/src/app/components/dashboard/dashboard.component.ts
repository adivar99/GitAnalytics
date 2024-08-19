import { Router } from '@angular/router';
import { Chart, registerables } from 'chart.js';
import { Component, OnInit, AfterViewInit, ViewChild } from '@angular/core';

import { AuthService } from 'src/app/services/auth.service';
import { HttpService } from 'src/app/services/http.service';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss'],
})
export class DashboardComponent implements OnInit, AfterViewInit{
  constructor(
    private auth: AuthService,
    private http: HttpService,
    private router: Router
  ) {}
  isOtherOpened = false;
  page = "dashboard"

  ngOnInit(): void {
      this.auth.set_project(null)
  }

  get_projects() {
    this.http.getData('/project/me').subscribe(
      (data: any) => {
        console.log(data)
      }
    )
  }

  onPageChange(page: string) {
    this.page = page
  }

  ngAfterViewInit(): void {

  }
}
