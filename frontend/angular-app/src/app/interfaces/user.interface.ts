import { Project } from "./project.interface";

export interface User {
  id: string;
  name: string;
  email: string;
  role: 'user' | 'admin' | 'manager';
  projects: Project[];
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateUserDto {
  name: string;
  email: string;
  role: 'user' | 'admin' | 'manager';
  password: string;
}

export interface UpdateUserDto {
  name?: string;
  email?: string;
  role?: 'user' | 'admin' | 'manager';
}
