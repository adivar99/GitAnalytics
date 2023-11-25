import { Injectable } from '@angular/core';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class UtilitiesService {

  constructor(
    private router: Router
  ) { }

  json_parameters_to_query(parameters: any) {
    let params = new URLSearchParams();
    for(let key in parameters) {
      params.set(key, parameters[key])
    }
    return params
  }

  redirect_page_to(page: string) {
    this.router.navigateByUrl(page)
  }
}
