import { Component, Input, OnInit } from '@angular/core';
import { NgForm } from '@angular/forms';

import { User } from '../../shared/user.model';
import { AuthService } from '../../services/auth.service';
import { HttpService } from '../../services/http.service';
import { UtilitiesService } from '../../services/utilities.service';
import { PermissionService } from '../../services/permission.service';


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
      }
    )
    this.auth.LoggedIn.subscribe(
      (login) => {
        this.isLoggedIn = login
      }
    )
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

  processLogout() {
    this.http.postData("/login/logout",{}).subscribe((data) => {
      this.auth.get_current_user()
      this.utils.redirect_page_to('landing')
      this.login_value = 'Get Started'
    })
  }

}
