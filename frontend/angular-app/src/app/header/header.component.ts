import { Component, Input, OnInit } from '@angular/core';
import { UtilitiesService } from '../services/utilities.service';
import { AuthService } from '../services/auth.service';
import { HttpService } from '../services/http.service';
import { User } from '../shared/user.model';
import { PermissionService } from '../services/permission.service';
import { NgForm } from '@angular/forms';


@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss']
})
export class HeaderComponent implements OnInit {

  login_value='Get Started'
  current_user: User | undefined;
  login_flag = true
  isLoggedIn = false;
  current_proj = null;
  project_menu = []

  canCreateProject = false;
  isProjectWindowOpened = false;
  isOtherOpened = false;
  
  constructor(
    private utils: UtilitiesService,
    private auth: AuthService,
    private http: HttpService,
    private perm: PermissionService,
  ) {}


  ngOnInit(): void {
    this.auth.currentUser.subscribe(
      (user: User) => {
        this.current_user = user;
        this.auth.refresh_projects()
      }
    )
    this.auth.LoggedIn.subscribe(
      (login) => {
        this.isLoggedIn = login
      }
    )
    this.auth.currentProject.subscribe((proj) => {
      console.log("Current project is: ")
      console.log(proj)
      this.current_proj = proj
    })
    // this.auth.refresh_projects()
    // let projects = this.auth.get_projects()
    // console.log("Getting projects: ")
    // console.log(projects)
    // this.project_menu = projects
    // this.current_proj = projects[0]
  }

  loginButton() {
    let val = this.login_value=='Get Started'?'login':'landing'
    this.login_value = this.login_value=='Get Started'?'Home':'Get Started'
    this.utils.redirect_page_to(val.toLowerCase())
  }

  menuClick(item: string) {
    if (item == "logout") {
      this.processLogout()
    } else {
      this.utils.redirect_page_to(item)
    }
  }

  project_menu_placeholder() {
    if(this.current_proj) {
      return {
        'name': this.current_proj.name,
        'icon': 'down'
      }
     } else if (this.current_user?.is_admin) {
        return {
          'name': 'Create Project',
          'icon': 'addcircleoutline'
        }
    } else {
      return {
        'name': 'Create Project Request',
        'icon': 'addcircleoutline'
      }
    }
  }

  toggleProjectWindow() {
    this.isProjectWindowOpened = !this.isProjectWindowOpened;
  }

  processLogout() {
    this.http.postData("/login/logout",{}).subscribe((data) => {
      this.auth.get_current_user()
      this.utils.redirect_page_to('landing')
      this.login_value = 'Get Started'
    })
  }

  createProject(form: NgForm) {
    let body = {
      "title": form.value.name,
      "description": form.value.description,
      "company_id": String(this.current_user.company_id)
    }
    console.log("Creating project with ");
    console.log(body)
    this.http.postData("/project/", body).subscribe((data) => {
      this.auth.set_project(data)
      this.auth.refresh_projects()
    })
    this.toggleProjectWindow()
  }

  updateProject(proj: string) {
    console.log("Updating project", proj)
  }

}
