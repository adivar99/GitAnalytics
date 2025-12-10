// import { Injectable } from '@angular/core';
// import { Observable, throwError } from 'rxjs';
// import { catchError, map } from 'rxjs/operators';
// import { User, CreateUserDto, UpdateUserDto } from '../interfaces/user.interface';
// import { environment } from '../../environments/environment';
// @Injectable({
//   providedIn: 'root'
// })
// export class UserService {
//     private apiUrl = `${environment.apiUrl}/users`;

//     constructor(private http: HttpClient) {}
  
//     getUsers(): Observable<User[]> {
//       return this.http.get<User[]>(this.apiUrl).pipe(
//         map(users => users.map(user => ({
//           ...user,
//           createdAt: new Date(user.createdAt),
//           updatedAt: new Date(user.updatedAt)
//         }))),
//         catchError(this.handleError)
//       );
//     }
  
//     getUserById(id: string): Observable<User> {
//       return this.http.get<User>(`${this.apiUrl}/${id}`).pipe(
//         map(user => ({
//           ...user,
//           createdAt: new Date(user.createdAt),
//           updatedAt: new Date(user.updatedAt)
//         })),
//         catchError(this.handleError)
//       );
//     }
  
//     createUser(userData: CreateUserDto): Observable<User> {
//       return this.http.post<User>(this.apiUrl, userData).pipe(
//         map(user => ({
//           ...user,
//           createdAt: new Date(user.createdAt),
//           updatedAt: new Date(user.updatedAt)
//         })),
//         catchError(this.handleError)
//       );
//     }
  
//     updateUser(id: string, userData: UpdateUserDto): Observable<User> {
//       return this.http.patch<User>(`${this.apiUrl}/${id}`, userData).pipe(
//         map(user => ({
//           ...user,
//           createdAt: new Date(user.createdAt),
//           updatedAt: new Date(user.updatedAt)
//         })),
//         catchError(this.handleError)
//       );
//     }
  
//     deleteUser(id: string): Observable<void> {
//       return this.http.delete<void>(`${this.apiUrl}/${id}`).pipe(
//         catchError(this.handleError)
//       );
//     }
  
//     updateUserProjects(userId: string, projectIds: string[]): Observable<User> {
//       return this.http.post<User>(`${this.apiUrl}/${userId}/projects`, { projectIds }).pipe(
//         map(user => ({
//           ...user,
//           createdAt: new Date(user.createdAt),
//           updatedAt: new Date(user.updatedAt)
//         })),
//         catchError(this.handleError)
//       );
//     }
  
//     private handleError(error: any) {
//       console.error('An error occurred:', error);
//       return throwError(() => new Error(error.message || 'Server error'));
//     }
// }
