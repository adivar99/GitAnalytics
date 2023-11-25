import { EventEmitter, Injectable } from '@angular/core';
import { HttpService } from './http.service';
import { PERMISSION } from '../shared/permission.enum';
import { AuthService } from './auth.service';


@Injectable({
  providedIn: 'root'
})
export class PermissionService {
  
  constructor(
    private http: HttpService,
    private auth: AuthService,
  ) {
    // Whenever the current project is changed
    this.auth.currentProject.subscribe((proj) => {
      // Get new permissions from backend
      let params = {'proj_id': proj.id}
      this.http.getData('/user/permissions', params).subscribe((perms: PERMISSION[]) => {
        this.my_permissions = perms
        console.log("Got permissions")
        console.log(perms)
        this.permChanged.emit(this.my_permissions)
      })
    })
  }

  my_permissions: PERMISSION[] = [];
  permChanged = new EventEmitter<PERMISSION[]>();

  has_permission(perm: PERMISSION) {
    return this.my_permissions.includes(perm);
  }
}
