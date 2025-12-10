// import { Injectable } from '@angular/core';
// import { HttpClient } from '@angular/common/http';
// import { Observable, throwError } from 'rxjs';
// import { catchError, map } from 'rxjs/operators';
// import { Project, CreateProjectDto } from '../interfaces/project.interface';
// // import { environment } from '../../environments/environment';

// @Injectable({
//   providedIn: 'root'
// })
// export class ProjectService {
//   private apiUrl = `${environment.apiUrl}/projects`;

//   constructor(private http: HttpClient) {}

//   getProjects(): Observable<Project[]> {
//     return this.http.get<Project[]>(this.apiUrl).pipe(
//       map(projects => projects.map(project => ({
//         ...project,
//         createdAt: new Date(project.createdAt),
//         updatedAt: new Date(project.updatedAt)
//       }))),
//       catchError(this.handleError)
//     );
//   }

//   getProjectById(id: string): Observable<Project> {
//     return this.http.get<Project>(`${this.apiUrl}/${id}`).pipe(
//       map(project => ({
//         ...project,
//         createdAt: new Date(project.createdAt),
//         updatedAt: new Date(project.updatedAt)
//       })),
//       catchError(this.handleError)
//     );
//   }

//   createProject(projectData: CreateProjectDto): Observable<Project> {
//     return this.http.post<Project>(this.apiUrl, projectData).pipe(
//       map(project => ({
//         ...project,
//         createdAt: new Date(project.createdAt),
//         updatedAt: new Date(project.updatedAt)
//       })),
//       catchError(this.handleError)
//     );
//   }

//   updateProject(id: string, projectData: Partial<CreateProjectDto>): Observable<Project> {
//     return this.http.patch<Project>(`${this.apiUrl}/${id}`, projectData).pipe(
//       map(project => ({
//         ...project,
//         createdAt: new Date(project.createdAt),
//         updatedAt: new Date(project.updatedAt)
//       })),
//       catchError(this.handleError)
//     );
//   }

//   deleteProject(id: string): Observable<void> {
//     return this.http.delete<void>(`${this.apiUrl}/${id}`).pipe(
//       catchError(this.handleError)
//     );
//   }

//   private handleError(error: any) {
//     console.error('An error occurred:', error);
//     return throwError(() => new Error(error.message || 'Server error'));
//   }
// }
