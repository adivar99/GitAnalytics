import { Component, OnInit, AfterViewInit, ViewChild } from '@angular/core';
import { AuthService } from 'src/app/services/auth.service';
import { HttpService } from 'src/app/services/http.service';
import { Chart, registerables } from 'chart.js';

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
  ) {}

  projects = [
    {id: 1, name: "FortiDevSec", description: "Product to scan your static and Dynamic code", users: 4, rating: 4.5, access: "user", lastScanned: new Date()},
    {id: 2, name: "FortiDAST", description: "Product to scan your dynamic website for vulns", users: 8, rating: 2.8, access: "user", lastScanned: new Date()},
    {id: 3, name: "FortiAIOps", description: "Product that leverages AI to evaluate your attack surfaces", users: 6, rating: 3.5, access: "user", lastScanned: new Date()},
  ];
  isOtherOpened = false;

  ngOnInit(): void {
      // this.get_projects()
  }

  get_projects() {
    this.http.getData('/project/me').subscribe(
      (data: any) => {
        // this.auth.set_projects(data)
        this.projects = data;
        console.log(data)
      }
    )
  }

  ngAfterViewInit(): void {

  }
}
