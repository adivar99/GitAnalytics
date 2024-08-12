import { Component, EventEmitter, Output } from '@angular/core';
import { UtilitiesService } from 'src/app/services/utilities.service';

@Component({
    selector: 'app-side-nav',
    templateUrl: './side-nav.component.html',
    styleUrls: ['./side-nav.component.scss']
})
export class SideNavComponent{
    isExpanded: boolean = false;
    toggleMenu = new EventEmitter();

    @Output() pageChanged = new EventEmitter<string>();

    constructor(
        private utils: UtilitiesService
    ) {}

    public routeLinks = [
        { link: "dashboard", name: "Dashboard", icon: "analytics"},
        { link: "users", name: "User Management", icon: "people"},
    ]

    toggleSidenav() {
        this.isExpanded = !this.isExpanded
    }

    onPageRedirect(page: string) {
        this.pageChanged.emit(page)
    }
}