import { Component, OnInit, AfterViewInit, ViewChild } from '@angular/core';
import { AuthService } from 'src/app/services/auth.service';
import { HttpService } from 'src/app/services/http.service';
// import { Chart, registerables } from 'chart.js';
import Chart from 'chart.js/auto';
// Chart.register(...registerables);

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})


export class DashboardComponent implements OnInit, AfterViewInit{

  @ViewChild('chart1') chart1Canvas: any;
  @ViewChild('chart2') chart2Canvas: any;

  constructor(
    private auth: AuthService,
    private http: HttpService,
  ) {}

  projects = [];
  isOtherOpened = false;

  ngOnInit(): void {
      // this.get_projects()
  }

  get_projects() {
    this.http.getData('/project/me').subscribe(
      (data: any) => {
        this.auth.set_projects(data)
        this.projects = data;
        console.log(data)
      }
    )
  }

  toggleOther() {
    this.isOtherOpened = !this.isOtherOpened;
  }

  ngAfterViewInit(): void {
    // Dummy data for charts
    const data1 = {
      labels: ['January', 'February', 'March', 'April', 'May'],
      datasets: [{
        label: 'Chart 1',
        data: [10, 20, 30, 40, 50],
        borderColor: 'rgba(75,192,192,1)',
        borderWidth: 1
      }]
    };

    const data2 = {
      labels: ['June', 'July', 'August', 'September', 'October'],
      datasets: [{
        label: 'Chart 2',
        data: [50, 40, 30, 20, 10],
        borderColor: 'rgba(192,75,192,1)',
        borderWidth: 1
      }]
    };

    // Create charts
    const chart1 = new Chart(this.chart1Canvas.nativeElement, {
      type: 'line',
      data: data1
    });

    const chart2 = new Chart(this.chart2Canvas.nativeElement, {
      type: 'line',
      data: data2
    });
  }
}
