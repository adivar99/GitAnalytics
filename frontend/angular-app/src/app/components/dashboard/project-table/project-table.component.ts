import { Component, OnInit } from '@angular/core';
import { AuthService } from 'src/app/services/auth.service';
import { HttpService } from 'src/app/services/http.service';
import { UtilitiesService } from 'src/app/services/utilities.service';
import { Project } from 'src/app/shared/project.model';

@Component({
    selector: 'app-project-table',
    templateUrl: './project-table.component.html',
    styleUrls: ['./project-table.component.scss']
})
export class ProjectTableComponent implements OnInit {
    projects: Project[] = [];
    searchValue = '';
    showProjects: Project[];
    isCreateFormOpen = false;
    newProject = {
        title: '',
        description: '',
        company_id: undefined
    };

    constructor(
        private utils: UtilitiesService,
        private http: HttpService,
        private auth: AuthService,
    ) {
        this.showProjects = this.projects;
    }

    ngOnInit() {
        this.refresh_projects();
    }

    refresh_projects() {
        this.http.getData('/project/me').subscribe((data: Project[]) => {
            this.projects = data;
            this.showProjects = this.projects;
        });
    }

    redirect_project(project) {
        this.auth.set_project(project)
        this.utils.redirect_page_to('dashboard/' + project.id);
    }

    filterProjects(e: Event) {
        this.showProjects = this.projects.filter((item) => 
            item.title.toLowerCase().includes(this.searchValue.toLowerCase())
        );
    }

    openCreateProjectForm() {
        this.isCreateFormOpen = true;
    }

    closeCreateProjectForm() {
        this.isCreateFormOpen = false;
        this.resetNewProject();
    }

    resetNewProject() {
        this.newProject = {
            title: '',
            description: '',
            company_id: undefined
        };
    }

    onSubmit() {
        let myUser = this.auth.get_user()
        this.newProject.company_id = myUser.company_id
        console.log("Sending data for project-create: ")
        console.log(this.newProject)
        this.http.postData('/project', this.newProject).subscribe(
            (response: Project) => {
                console.log('Project created:', response);
                this.refresh_projects();
                this.closeCreateProjectForm();
            },
            (error) => {
                console.error('Error creating project:', error);
                // Handle error (e.g., show error message to user)
            }
        );
    }
}