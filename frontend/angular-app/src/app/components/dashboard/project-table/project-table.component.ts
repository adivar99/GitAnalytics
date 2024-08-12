import { Component, Input } from '@angular/core';

import { UtilitiesService } from 'src/app/services/utilities.service';

@Component({
    selector: 'app-project-table',
    templateUrl: './project-table.component.html',
    styleUrls: ['./project-table.component.scss']
})
export class ProjectTableComponent {
    projects = [
        {id: 1, name: "FortiDevSec", description: "Product to scan your static and Dynamic code", users: 4, rating: 4.5, access: "user", lastScanned: new Date()},
        {id: 2, name: "FortiDAST", description: "Product to scan your dynamic website for vulns", users: 8, rating: 2.8, access: "user", lastScanned: new Date()},
        {id: 3, name: "FortiAIOps", description: "Product that leverages AI to evaluate your attack surfaces", users: 6, rating: 3.5, access: "user", lastScanned: new Date()},
      ];
      searchValue='';
      showProjects

    constructor(
        private utils: UtilitiesService
    ) {
        this.showProjects = this.projects
    }

    redirect_project(project: string) {
        this.utils.redirect_page_to('project/'+project)
    }

    filterProjects(e) {
        console.log("In filter projects");
        console.log(this.searchValue)
        this.showProjects = this.projects.filter((item) => item['name'].toLowerCase().includes(this.searchValue))
    }
}