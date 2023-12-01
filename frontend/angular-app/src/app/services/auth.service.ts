import { EventEmitter, Injectable } from '@angular/core';
import { HttpService } from './http.service';
import { User } from '../shared/user.model';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  constructor(
    private http: HttpService,
  ) { }
  user: User | undefined;
  projects = []
  currentProject = new EventEmitter<any>();
  currentUser = new EventEmitter<User>();
  LoggedIn = new EventEmitter<boolean>();

  // get_logged_in() {
  //   return this.
  // }
  
  set_logged_in(val: any) {
    this.LoggedIn.emit(val)
  }

  get_user() {
    return this.user;
  }

  set_user(val: any) {
    this.user = val
    this.currentUser.emit(this.user)
  }

  get_current_user() {
    this.http.getData('/user/me').subscribe((data) => {
      if(data != undefined) {
        this.set_user(data)
      }
    }, (error) => {
      this.set_user(undefined)
      this.LoggedIn.emit(false)
      console.log(error)
    })
  }

  refresh_projects() {
    this.http.getData('/project/me').subscribe((data) => {
      if(data != undefined) {
        this.set_projects(data)
      }
    }, (error) => {
      this.set_project(undefined)
      console.log(error)
    })
  }

  get_projects() {
    return this.projects
  }

  set_projects(data) {
    console.log("projects has been set")
    console.log(data)
    this.projects = data;
  }

  set_project(proj) {
    this.currentProject.emit(proj)
  }

}
