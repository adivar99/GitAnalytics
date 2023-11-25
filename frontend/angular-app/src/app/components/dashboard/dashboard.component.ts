import { Component, OnInit } from '@angular/core';
import { AuthService } from 'src/app/services/auth.service';
import { HttpService } from 'src/app/services/http.service';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss'],
})
export class DashboardComponent implements OnInit{

  constructor(
    private auth: AuthService,
    private http: HttpService,
  ) {}

  projects = [];
  task_list = [];
  isProject = false;

  ngOnInit(): void {
    this.auth.currentProject.subscribe((proj) => {
      this.isProject = true;
      this.get_tasks(proj.id)
    })
  }

  get_tasks(proj_id: number) {
    this.http.getData('/task/project/'+String(proj_id)).subscribe(
      (data: any) => {
        this.task_list = data
      }
    )
  }
}
