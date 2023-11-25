import { Component } from '@angular/core';
import { AuthService } from './services/auth.service';
import { UtilitiesService } from './services/utilities.service';
import { HttpService } from './services/http.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {

  constructor(
    private http: HttpService,
    private auth: AuthService,
    private utils: UtilitiesService,
  ) {}

  title = 'angular-app';


  logged_in = false;
  
  ngOnInit(){
    this.auth.LoggedIn.subscribe((login) => {
      this.logged_in = login
    })
    this.auto_login()
  }

  auto_login() {
    this.http.getData('/login/access-token').subscribe((data) => {
      if(data != undefined) {
        this.auth.set_logged_in(true)
      }
      this.app_start()
    }, (error) => {
      console.log(error)
      this.app_start()
    })
  }

  app_start() {
    if(this.logged_in) {
      this.auth.get_current_user()
      this.utils.redirect_page_to('dashboard')
    } else {
      this.utils.redirect_page_to('landing')
    }
  }
}
