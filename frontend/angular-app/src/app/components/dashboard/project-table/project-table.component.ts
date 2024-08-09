import { Component, OnInit, Input } from '@angular/core';
import { UtilitiesService } from 'src/app/services/utilities.service';
import { Project } from 'src/app/shared/project.model';

@Component({
    selector: 'app-project-table',
    templateUrl: './project-table.component.html',
    styleUrls: ['./project-table.component.scss']
})
export class ProjectTableComponent{
    @Input() projects: Project[]

    constructor(
        private utils: UtilitiesService
    ) {}

    redirect_project(project: string) {
        this.utils.redirect_page_to('project/'+project)
    }
}