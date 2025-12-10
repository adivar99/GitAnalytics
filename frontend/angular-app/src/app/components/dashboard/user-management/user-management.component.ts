import { Component, OnInit, ViewChild, TemplateRef } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatPaginator } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { FormBuilder, FormGroup, FormControl, Validators } from '@angular/forms';

import { HttpService } from 'src/app/services/http.service';


interface User {
    id: string;
    name: string;
    email: string;
    role: string;
    projects: Project[];
}

interface Project {
    id: string;
    name: string;
}

@Component({
    selector: 'app-user-management',
    templateUrl: './user-management.component.html',
    styleUrls: ['./user-management.component.scss']
})
export class UserManagementComponent implements OnInit {
    // users = new MatTableDataSource<User>([]);
    // availableProjects: Project[] = [];
    // displayedColumns: string[] = ['name', 'email', 'role', 'projects', 'actions'];
    // userForm: FormGroup;
    // selectedProjects = new FormControl([]);
    // isEditing = false;
    // currentUser: User | null = null;
    // @ViewChild(MatPaginator) paginator!: MatPaginator;
    // @ViewChild('userFormDialog') userFormDialog!: TemplateRef<any>;
    // @ViewChild('projectAssignmentDialog') projectAssignmentDialog!: TemplateRef<any>;
    // constructor(
    //     private dialog: MatDialog,
    //     private fb: FormBuilder,
    //     private userService: UserService,
    //     private projectService: ProjectService,
    // ) {
    //     this.userForm = this.fb.group({
    //         name: ['', Validators.required],
    //         email: ['', [Validators.required, Validators.email]],
    //         role: ['user', Validators.required]
    //     });
    // }
    async ngOnInit() {
        // await this.loadUsers();
        // await this.loadProjects();
    }
    // ngAfterViewInit() {
    //     this.users.paginator = this.paginator;
    // }

    // async loadUsers() {
    //     this.userService.getUsers().subscribe({
    //         next: (users) => {
    //             this.users.data = users;
    //         },
    //         error: (error) => {
    //             console.error('Error loading users:', error);
    //             // Implement error handling (e.g., show snackbar)
    //         }
    //     });
    // }

    // async loadProjects() {
    //     this.projectService.getProjects().subscribe({
    //         next: (projects) => {
    //             this.availableProjects = projects;
    //         },
    //         error: (error) => {
    //             console.error('Error loading projects:', error);
    //             // Implement error handling
    //         }
    //     });
    // }
    // openCreateUserDialog() {
    //     this.isEditing = false;
    //     this.userForm.reset({ role: 'user' });
    //     this.dialog.open(this.userFormDialog, {
    //         width: '500px'
    //     });
    // }
    // editUser(user: User) {
    //     this.isEditing = true;
    //     this.currentUser = user;
    //     this.userForm.patchValue({
    //         name: user.name,
    //         email: user.email,
    //         role: user.role
    //     });
    //     this.dialog.open(this.userFormDialog, {
    //         width: '500px'
    //     });
    // }

    // async saveUser() {
    //     if (this.userForm.valid) {
    //         const userData = this.userForm.value;
            
    //         const operation = this.isEditing && this.currentUser
    //             ? this.userService.updateUser(this.currentUser.id, userData)
    //             : this.userService.createUser({ ...userData, password: 'temporary' }); // You might want to handle password differently

    //         operation.subscribe({
    //             next: () => {
    //                 this.dialog.closeAll();
    //                 this.loadUsers();
    //             },
    //             error: (error) => {
    //                 console.error('Error saving user:', error);
    //                 // Implement error handling
    //             }
    //         });
    //     }
    // }
    // manageUserProjects(user: User) {
    //     this.currentUser = user;
    //     this.selectedProjects.setValue(user.projects.map(p => p.id));
    //     this.dialog.open(this.projectAssignmentDialog, {
    //         width: '500px'
    //     });
    // }
    // async saveUserProjects() {
    //     if (this.currentUser) {
    //         this.userService.updateUserProjects(
    //             this.currentUser.id,
    //             this.selectedProjects.value
    //         ).subscribe({
    //             next: () => {
    //                 this.dialog.closeAll();
    //                 this.loadUsers();
    //             },
    //             error: (error) => {
    //                 console.error('Error updating user projects:', error);
    //                 // Implement error handling
    //             }
    //         });
    //     }
    // }
}
