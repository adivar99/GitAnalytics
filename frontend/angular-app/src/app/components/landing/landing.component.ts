import { Component } from '@angular/core';
import { UtilitiesService } from 'src/app/services/utilities.service';

@Component({
  selector: 'app-landing',
  templateUrl: './landing.component.html',
  styleUrls: ['./landing.component.scss']
})
export class LandingComponent {
  constructor(
    private utils: UtilitiesService,
  ) {}

redirectTo(page: string) {
  this.utils.redirect_page_to(page.toLowerCase())
}
}
