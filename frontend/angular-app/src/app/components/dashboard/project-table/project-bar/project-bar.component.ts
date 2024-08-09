import { Component, OnInit, Input } from '@angular/core';

import { Project } from '../../../../shared/project.model'

@Component({
    selector: 'app-project-bar',
    templateUrl: './project-bar.component.html',
    styleUrls: ['./project-bar.component.css'],
})
export class ProjectBarComponent implements OnInit {
    @Input() project: Project

    ngOnInit(): void { }

}
