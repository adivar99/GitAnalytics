# Hasura Configuration Guide

This document explains how to configure Hasura Actions and Permissions for the GitAnalytics platform.

## Prerequisites

1. Hasura GraphQL Engine running (via docker-compose)
2. Database schema created and tracked in Hasura
3. Go server running on port 8081

## 1. Hasura Actions Configuration

### Create Project Action

1. Navigate to Hasura Console (http://localhost:8080)
2. Go to the "Actions" tab
3. Click "Create Action"
4. Configure as follows:

**Action Definition:**
```graphql
type Mutation {
  createProject(input: CreateProjectInput!): Project!
}
```

**New Types:**
```graphql
input CreateProjectInput {
  name: String!
  managerUserId: uuid!
  description: String
  repoUrl: String
}

type Project {
  id: uuid!
  name: String!
  companyId: uuid!
  managerUserId: uuid!
  description: String
  repoUrl: String
  createdAt: timestamptz!
}
```

**Handler URL:**
```
http://go-server:8081/create-project
```

**Request Options:**
- Method: POST
- Content-Type: application/json

### Assign Member Action

1. Create another action in the Actions tab
2. Configure as follows:

**Action Definition:**
```graphql
type Mutation {
  assignMember(input: AssignMemberInput!): ProjectMember!
}
```

**New Types:**
```graphql
input AssignMemberInput {
  projectId: uuid!
  userId: uuid!
  role: ProjectMemberRole!
}

type ProjectMember {
  id: uuid!
  projectId: uuid!
  userId: uuid!
  role: ProjectMemberRole!
  joinedAt: timestamptz!
}

enum ProjectMemberRole {
  DEVELOPER
  GUEST
}
```

**Handler URL:**
```
http://go-server:8081/assign-member
```

**Request Options:**
- Method: POST
- Content-Type: application/json

## 2. Hasura Relationships Configuration

**IMPORTANT:** Before setting up permissions, you must create the necessary relationships between tables. Hasura needs these relationships to understand how tables are connected.

### Create Relationships

1. Navigate to Hasura Console (http://localhost:8080)
2. Go to the "Data" tab
3. Select your database (postgresDB)
4. For each relationship below, go to the table and click "Relationships" → "Add Relationship"

#### Projects → Project Members (One-to-Many)

**Table:** `projects`
- **Relationship Name:** `project_members`
- **Type:** Array Relationship
- **Configuration:**
  - **From:** `projects.id`
  - **To:** `project_members.project_id`

#### Project Members → Projects (Many-to-One)

**Table:** `project_members`
- **Relationship Name:** `project`
- **Type:** Object Relationship
- **Configuration:**
  - **From:** `project_members.project_id`
  - **To:** `projects.id`

#### Project Members → Users (Many-to-One)

**Table:** `project_members`
- **Relationship Name:** `user`
- **Type:** Object Relationship
- **Configuration:**
  - **From:** `project_members.user_id`
  - **To:** `users.id`

#### Projects → Companies (Many-to-One)

**Table:** `projects`
- **Relationship Name:** `company`
- **Type:** Object Relationship
- **Configuration:**
  - **From:** `projects.company_id`
  - **To:** `companies.id`

#### Git Commits → Projects (Many-to-One)

**Table:** `git_commits`
- **Relationship Name:** `project`
- **Type:** Object Relationship
- **Configuration:**
  - **From:** `git_commits.project_id`
  - **To:** `projects.id`

#### Git Branches → Projects (Many-to-One)

**Table:** `git_branches`
- **Relationship Name:** `project`
- **Type:** Object Relationship
- **Configuration:**
  - **From:** `git_branches.project_id`
  - **To:** `projects.id`

#### Churn Metrics → Projects (Many-to-One)

**Table:** `churn_metrics`
- **Relationship Name:** `project`
- **Type:** Object Relationship
- **Configuration:**
  - **From:** `churn_metrics.project_id`
  - **To:** `projects.id`

#### File Extension Stats → Git Commits (Many-to-One)

**Table:** `file_extension_stats`
- **Relationship Name:** `commit`
- **Type:** Object Relationship
- **Configuration:**
  - **From:** `file_extension_stats.commit_hash`
  - **To:** `git_commits.hash`

#### Users → Companies (Many-to-One)

**Table:** `users`
- **Relationship Name:** `company`
- **Type:** Object Relationship
- **Configuration:**
  - **From:** `users.company_id`
  - **To:** `companies.id`

## 3. Hasura Permissions Configuration

### Role-Based Access Control

**IMPORTANT:** Make sure all relationships are created (see Section 2) before configuring permissions. Permissions that reference relationships will fail if the relationships don't exist.

Configure permissions for each role in the "Permissions" tab of each table:

#### Admin Role

**Companies Table:**
- Select: `{"company_id": {"_eq": "X-Hasura-Company-Id"}}`
- Insert: Allow all (admin creates companies)
- Update: Allow all
- Delete: Allow all

**Users Table:**
- Select: `{"company_id": {"_eq": "X-Hasura-Company-Id"}}`
- Insert: Allow all
- Update: Allow all
- Delete: Allow all

**Projects Table:**
- Select: `{"company_id": {"_eq": "X-Hasura-Company-Id"}}`
- Insert: Allow all
- Update: Allow all
- Delete: Allow all

**Project Members Table:**
- Select: `{"project": {"company_id": {"_eq": "X-Hasura-Company-Id"}}}`
- Insert: Allow all
- Update: Allow all
- Delete: Allow all

**Git Commits, Git Branches, Churn Metrics, File Extension Stats:**
- Select: `{"project": {"company_id": {"_eq": "X-Hasura-Company-Id"}}}`
- Insert: Allow all
- Update: Allow all
- Delete: Allow all

#### Manager Role

**Projects Table:**
- Select: `{"manager_user_id": {"_eq": "X-Hasura-User-Id"}}`
- Update: `{"manager_user_id": {"_eq": "X-Hasura-User-Id"}}`
- Insert: Not allowed
- Delete: Not allowed

**Project Members Table:**
- Select: `{"project": {"manager_user_id": {"_eq": "X-Hasura-User-Id"}}}`
- Insert: `{"project": {"manager_user_id": {"_eq": "X-Hasura-User-Id"}}}`
- Update: `{"project": {"manager_user_id": {"_eq": "X-Hasura-User-Id"}}}`
- Delete: `{"project": {"manager_user_id": {"_eq": "X-Hasura-User-Id"}}}`

**Git Commits, Git Branches, Churn Metrics, File Extension Stats:**
- Select: `{"project": {"manager_user_id": {"_eq": "X-Hasura-User-Id"}}}`
- Insert: `{"project": {"manager_user_id": {"_eq": "X-Hasura-User-Id"}}}`
- Update: Not allowed
- Delete: Not allowed

#### Developer Role

**Projects Table:**
- Select: `{"_or": [{"manager_user_id": {"_eq": "X-Hasura-User-Id"}}, {"project_members": {"user_id": {"_eq": "X-Hasura-User-Id"}}}]}`
  - **Note:** This uses the `project_members` relationship (array relationship from projects)
- Insert: Not allowed
- Update: Not allowed
- Delete: Not allowed

**Project Members Table:**
- Select: `{"user_id": {"_eq": "X-Hasura-User-Id"}}`
- Insert: Not allowed
- Update: Not allowed
- Delete: Not allowed

**Git Commits, Git Branches, Churn Metrics, File Extension Stats:**
- Select: `{"project": {"_or": [{"manager_user_id": {"_eq": "X-Hasura-User-Id"}}, {"project_members": {"user_id": {"_eq": "X-Hasura-User-Id"}}}]}}`
  - **Note:** This uses the `project` relationship (object relationship) and then the `project_members` relationship
- Insert: Not allowed
- Update: Not allowed
- Delete: Not allowed

#### Guest Role

**Projects Table:**
- Select: `{"project_members": {"user_id": {"_eq": "X-Hasura-User-Id"}, "role": {"_eq": "GUEST"}}}`
- Insert: Not allowed
- Update: Not allowed
- Delete: Not allowed

**Git Commits, Git Branches, Churn Metrics, File Extension Stats:**
- Select: `{"project": {"project_members": {"user_id": {"_eq": "X-Hasura-User-Id"}, "role": {"_eq": "GUEST"}}}`
- Insert: Not allowed
- Update: Not allowed
- Delete: Not allowed

### Alternative: Simplified Developer Permissions

If you're having issues with nested relationships in permissions, you can use a simpler approach:

**Projects Table (Developer):**
- Select: `{"_or": [{"manager_user_id": {"_eq": "X-Hasura-User-Id"}}, {"id": {"_in": "X-Hasura-Project-Ids"}}]}`
  - **Note:** This requires adding `X-Hasura-Project-Ids` to JWT claims (array of project IDs the user is a member of)

Or use a custom check function, or query `project_members` first and then filter projects.

**Recommended Approach:** Use the relationship-based permissions as shown above, but ensure:
1. All relationships are created first (Section 2)
2. The relationship names match exactly (case-sensitive)
3. You're using the relationship name, not the table name

## 4. JWT Configuration

Ensure the JWT secret in Hasura matches the one in the Go server:

**Hasura Environment Variable:**
```json
{
  "type": "HS256",
  "key": "your-super-secret-jwt-key-change-this-in-production"
}
```

**Go Server Environment Variable:**
```
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
```

## 5. Testing Actions

After configuration, test the actions in the Hasura API Explorer:

**Test Create Project:**
```graphql
mutation {
  createProject(input: {
    name: "Test Project"
    managerUserId: "uuid-here"
  }) {
    id
    name
    companyId
  }
}
```

**Test Assign Member:**
```graphql
mutation {
  assignMember(input: {
    projectId: "uuid-here"
    userId: "uuid-here"
    role: DEVELOPER
  }) {
    id
    projectId
    userId
    role
  }
}
```

## Troubleshooting

### Error: "project_members does not exist"

This error occurs when:
1. The relationship hasn't been created yet
2. The relationship name doesn't match

**Solution:**
1. Go to the "Data" tab → Select your table (e.g., `projects`)
2. Click "Relationships" tab
3. Verify the relationship `project_members` exists
4. If it doesn't exist, create it (see Section 2)
5. Make sure the relationship name in permissions matches exactly (case-sensitive)

### Error: "Inconsistent object" in permissions

This usually means:
- A relationship is missing
- A relationship name is misspelled
- The relationship configuration is incorrect

**Solution:**
1. Check all relationships are created (Section 2)
2. Verify relationship names match exactly
3. Test relationships in the GraphQL API Explorer first

## Notes

- **Always create relationships before setting permissions** - permissions that reference relationships will fail if relationships don't exist
- Relationship names are case-sensitive - use exact names as created
- Replace `X-Hasura-Company-Id` with actual session variable if you add it to JWT claims
- Adjust permissions based on your specific security requirements
- Test all permissions thoroughly before deploying to production

