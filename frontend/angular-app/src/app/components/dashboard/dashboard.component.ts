import { Component, OnInit, AfterViewInit, ViewChild } from '@angular/core';
import { AuthService } from 'src/app/services/auth.service';
import { HttpService } from 'src/app/services/http.service';
import { Chart, registerables } from 'chart.js';
import { Router } from '@angular/router';

// import Chart from 'chart.js/auto';
Chart.register(...registerables);

const displayedColumns: string[] = ["name", "users", "rating"];
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
      // this.get_projects()
  }

  get_projects() {
    this.http.getData('/project/me').subscribe(
      (data: any) => {
        // this.auth.set_projects(data)
        // this.projects = data;
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
