import { Component, ElementRef, ViewChild } from '@angular/core';
import { HttpService } from '../../services/http.service';
import { AuthService } from '../../services/auth.service';
import { UtilitiesService } from '../../services/utilities.service';
import { ControlContainer } from '@angular/forms';

@Component({
  selector: 'app-login-page',
  templateUrl: './login-page.component.html',
  styleUrls: ['./login-page.component.scss']
})
export class LoginPageComponent {
  constructor(
    private httpService: HttpService,
    private authService: AuthService,
    private utils: UtilitiesService,
  ) {}

  login = {username: '', password: ''}

  @ViewChild('mainContainer', {'static': false}) containerRef: ElementRef;

  addContainerClass() {
    console.log("Called container class function")
    this.containerRef.nativeElement.classList.toggle('right-panel-active')
  }

  removeContainerClass() {
    console.log("Called container class function")
    this.containerRef.nativeElement.classList.toggle('right-panel-active')
  }

  submit() {
    // Call login API here
    console.log("Is form valid:", this.login)
    let formData = new FormData();
    formData.append("username", this.login.username)
    formData.append("password", this.login.password)
    formData.append("client_id", '')
    formData.append("client_secret", '')
    formData.append("grant_type", '')
    formData.append("scope", '')
    this.httpService.postData('/login/access-token', formData).subscribe(
      (data) => {
        this.authService.set_logged_in(true);
        this.authService.get_current_user()
        this.utils.redirect_page_to('dashboard')
    }, (error) => {
      // this.notifyService.error(error.error.detail);
      console.log(error)
    })
  }

}
