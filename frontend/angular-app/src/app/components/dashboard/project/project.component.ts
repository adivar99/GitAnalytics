import { Component, OnInit } from '@angular/core';
import { AuthService } from 'src/app/services/auth.service';

@Component({
    selector: 'app-project',
    templateUrl: './project.component.html',
    styleUrls: ['./project.component.scss']
})
export class ProjectComponent implements OnInit {
    project;
    projectData = {
        commitHistory: {}
    }
    constructor(
        private auth: AuthService,
    ) {}

    ngOnInit() {
        this.project = this.auth.get_project()
    }
}