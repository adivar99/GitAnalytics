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
        commitHistory: [
            {
                data: [1, 2, 3, 4, 5],
                label: "User 1",
                borderColor: "red",
                fill: false
            },
            {
                data: [5, 4, 3, 2, 1],
                label: "User 2",
                borderColor: "blue",
                fill: false
            }
        ]
    }
    constructor(
        private auth: AuthService,
    ) {}

    ngOnInit() {
        this.project = this.auth.get_project()
        console.log("PROJECT DATA", this.projectData);
    }
}