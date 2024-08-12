import { Component, EventEmitter, Output, OnInit } from '@angular/core';
import { AuthService } from 'src/app/services/auth.service';
import { UtilitiesService } from 'src/app/services/utilities.service';

@Component({
    selector: 'app-side-nav',
    templateUrl: './side-nav.component.html',
    styleUrls: ['./side-nav.component.scss']
})
export class SideNavComponent implements OnInit {
    isExpanded: boolean = false;
    toggleMenu = new EventEmitter();
    isLoggedIn = false

    @Output() pageChanged = new EventEmitter<string>();

    constructor(
        private utils: UtilitiesService,
        private auth: AuthService
    ) {}

    ngOnInit() {

        this.auth.LoggedIn.subscribe(
            (login) => {
                console.log("Changing side-nav loggedIn to ", login)
                this.isLoggedIn = login
            }
        )
    }

    public routeLinks = [
        { link: "dashboard", name: "Dashboard", icon: "analytics"},
        { link: "dashboard/users", name: "User Management", icon: "people"},
    ]

    toggleSidenav() {
        this.isExpanded = !this.isExpanded
    }

    // onPageRedirect(page: string) {
    //     this.pageChanged.emit(page)
    // }
}