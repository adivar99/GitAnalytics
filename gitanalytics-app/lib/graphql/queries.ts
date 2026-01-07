import { gql } from '@apollo/client';

// Query to get current user
export const GET_CURRENT_USER = gql`
  query GetCurrentUser($userId: uuid!) {
    users(where: { id: { _eq: $userId } }) {
      id
      email
      full_name
      company_id
      company {
        id
        name
        max_projects
        admin_user_id
      }
    }
  }
`;

// Query to get all projects for a company (admin view)
export const GET_COMPANY_PROJECTS = gql`
  query GetCompanyProjects($companyId: uuid!) {
    projects(where: { company_id: { _eq: $companyId } }) {
      id
      name
      description
      repo_url
      manager_user_id
      manager {
        id
        email
        full_name
      }
      created_at
    }
  }
`;

// Query to get projects managed by a user
export const GET_MANAGED_PROJECTS = gql`
  query GetManagedProjects($managerId: uuid!) {
    projects(where: { manager_user_id: { _eq: $managerId } }) {
      id
      name
      description
      repo_url
      company_id
      created_at
    }
  }
`;

// Query to get projects where user is a member
export const GET_MEMBER_PROJECTS = gql`
  query GetMemberProjects($userId: uuid!) {
    project_members(where: { user_id: { _eq: $userId } }) {
      id
      role
      project {
        id
        name
        description
        repo_url
        company_id
        created_at
      }
    }
  }
`;

// Query to get project members
export const GET_PROJECT_MEMBERS = gql`
  query GetProjectMembers($projectId: uuid!) {
    project_members(where: { project_id: { _eq: $projectId } }) {
      id
      user_id
      role
      joined_at
      user {
        id
        email
        full_name
      }
    }
  }
`;

// Query to get branch health stats for a project
export const GET_BRANCH_HEALTH = gql`
  query GetBranchHealth($projectId: uuid!) {
    git_branches(where: { project_id: { _eq: $projectId } }) {
      id
      name
      health_status
      last_activity_at
    }
  }
`;

// Query to get file extension stats
// Note: This queries file stats through commits relationship
export const GET_FILE_EXTENSION_STATS = gql`
  query GetFileExtensionStats($projectId: uuid!) {
    git_commits(where: { project_id: { _eq: $projectId } }) {
      hash
      file_extension_stats {
        extension
        count
      }
    }
  }
`;

// Query to get churn metrics
export const GET_CHURN_METRICS = gql`
  query GetChurnMetrics($projectId: uuid!) {
    churn_metrics(
      where: { project_id: { _eq: $projectId } }
      order_by: { lines_overwritten: desc }
      limit: 20
    ) {
      id
      perpetrator_email
      victim_email
      lines_overwritten
      commit_hash
    }
  }
`;

// Query to get top contributors
export const GET_TOP_CONTRIBUTORS = gql`
  query GetTopContributors($projectId: uuid!) {
    git_commits(
      where: { project_id: { _eq: $projectId } }
      distinct_on: author_email
    ) {
      author_email
      author_name
    }
  }
`;

// Query to get company
export const GET_COMPANY = gql`
  query GetCompany($companyId: uuid!) {
    companies(where: { id: { _eq: $companyId } }) {
      id
      name
      max_projects
      admin_user_id
    }
  }
`;

// Mutation to create a project (via Hasura Action)
export const CREATE_PROJECT = gql`
  mutation CreateProject($name: String!, $managerUserId: uuid!) {
    createProject(input: { name: $name, managerUserId: $managerUserId }) {
      id
      name
      companyId
      managerUserId
    }
  }
`;

// Mutation to assign a member (via Hasura Action)
export const ASSIGN_MEMBER = gql`
  mutation AssignMember($projectId: uuid!, $userId: uuid!, $role: ProjectMemberRole!) {
    assignMember(
      input: { projectId: $projectId, userId: $userId, role: $role }
    ) {
      id
      projectId
      userId
      role
    }
  }
`;


// Query to get all users in the company
export const GET_COMPANY_USERS = gql`
  query GetCompanyUsers($companyId: uuid!) {
    users(where: { company_id: { _eq: $companyId } }) {
      id
      full_name
      email
      project_members_aggregate {
        aggregate {
          count
        }
      }
    }
  }
`;

// Mutation to add a new user
export const ADD_USER = gql`
  mutation AddUser($email: String!, $fullName: String!, $companyId: uuid!, $password: String!) {
    insert_users_one(object: {
      email: $email,
      full_name: $fullName,
      company_id: $companyId,
      password: $password
    }) {
      id
      email
      full_name
    }
  }
`;
