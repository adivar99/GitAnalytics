// TypeScript types matching the database schema

export interface Company {
  id: string;
  name: string;
  license_key: string;
  admin_user_id?: string;
  max_projects: number;
  created_at: string;
}

export interface User {
  id: string;
  email: string;
  password_hash: string;
  full_name?: string;
  company_id: string;
  created_at: string;
}

export interface Project {
  id: string;
  name: string;
  company_id: string;
  manager_user_id: string;
  description?: string;
  repo_url?: string;
  created_at: string;
}

export type ProjectMemberRole = 'DEVELOPER' | 'GUEST';

export interface ProjectMember {
  id: string;
  project_id: string;
  user_id: string;
  role: ProjectMemberRole;
  joined_at: string;
}

export interface GitCommit {
  hash: string;
  project_id: string;
  author_name?: string;
  author_email?: string;
  message?: string;
  branch_name?: string;
  committed_at?: string;
  created_at: string;
}

export type BranchHealthStatus = 'HOT' | 'STABLE' | 'STALE';

export interface GitBranch {
  id: string;
  project_id: string;
  name: string;
  last_commit_hash?: string;
  health_status: BranchHealthStatus;
  last_activity_at?: string;
}

export interface FileExtensionStat {
  id: string;
  commit_hash: string;
  extension: string;
  count: number;
}

export interface ChurnMetric {
  id: string;
  commit_hash: string;
  project_id: string;
  perpetrator_email?: string;
  victim_email?: string;
  lines_overwritten: number;
}

