# GitAnalytics CLI Architecture

## Overview

The GitAnalytics CLI is a standalone executable that analyzes git repositories and sends comprehensive analytics data to the GitAnalytics server.

## Architecture Diagram

```
┌─────────────────┐
│  Git Repository │
└────────┬────────┘
         │
         ▼
┌─────────────────────────────────────────┐
│         GitAnalytics CLI                │
│                                         │
│  ┌──────────────────────────────────┐  │
│  │  Analyzer Package                │  │
│  │  - git.go: Repository analysis   │  │
│  │  - branches.go: Branch health    │  │
│  │  - files.go: File statistics     │  │
│  │  - churn.go: Code churn metrics  │  │
│  └──────────────────────────────────┘  │
│                                         │
│  ┌──────────────────────────────────┐  │
│  │  Models Package                  │  │
│  │  - Data structures for analytics │  │
│  └──────────────────────────────────┘  │
│                                         │
│  ┌──────────────────────────────────┐  │
│  │  Client Package                  │  │
│  │  - HTTP client for server comm   │  │
│  └──────────────────────────────────┘  │
└─────────────────┬───────────────────────┘
                  │ JSON Payload
                  ▼
┌─────────────────────────────────────────┐
│      GitAnalytics Go Server             │
│                                         │
│  POST /api/analytics/ingest             │
│                                         │
│  ┌──────────────────────────────────┐  │
│  │  Analytics Handler               │  │
│  │  - Receives JSON payload         │  │
│  │  - Validates data                │  │
│  │  - Processes analytics           │  │
│  └──────────────────────────────────┘  │
└─────────────────┬───────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────────┐
│         Hasura GraphQL Engine           │
│                                         │
│  - insert_git_commits                   │
│  - insert_git_branches                  │
│  - insert_file_extension_stats          │
│  - insert_churn_metrics                 │
└─────────────────┬───────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────────┐
│         PostgreSQL Database             │
│                                         │
│  Tables:                                │
│  - git_commits                          │
│  - git_branches                         │
│  - file_extension_stats                 │
│  - churn_metrics                        │
│  - projects                             │
└─────────────────────────────────────────┘
```

## Components

### 1. CLI Components

#### Analyzer Package
- **git.go**: Main repository analysis orchestrator
  - Opens git repository
  - Iterates through branches
  - Collects commits and metadata
  
- **branches.go**: Branch health analysis
  - Calculates commit frequency
  - Determines health status (HOT/STABLE/STALE)
  - Tracks last activity

- **files.go**: File statistics
  - Extracts file extensions
  - Counts file changes
  - Tracks most updated files

- **churn.go**: Code churn analysis
  - Analyzes git diffs
  - Identifies code overwrites
  - Tracks perpetrator/victim relationships

#### Models Package
- Defines data structures for all analytics
- Ensures type safety
- Provides JSON serialization

#### Client Package
- HTTP client for server communication
- Handles JSON encoding
- Manages timeouts and errors

#### Config Package
- YAML configuration parsing
- CLI flag handling
- Configuration merging

### 2. Server Components

#### Analytics Handler (`server/handlers/analytics.go`)
- **IngestAnalytics**: Main endpoint handler
  - Validates incoming data
  - Processes analytics
  - Returns success/error response

- **processAnalytics**: Data processing orchestrator
  - Coordinates all insert operations
  - Handles transactions

- **Insert Functions**:
  - `insertCommits`: Batch insert git commits
  - `insertBranches`: Upsert branch data
  - `insertFileExtensionStats`: Insert file statistics
  - `insertChurnMetrics`: Insert churn data

## Data Flow

1. **Analysis Phase**:
   ```
   Repository → Analyzer → Models (in-memory)
   ```

2. **Transmission Phase**:
   ```
   Models → JSON → HTTP POST → Server
   ```

3. **Storage Phase**:
   ```
   Server → Hasura GraphQL → PostgreSQL
   ```

## Configuration

### CLI Configuration (.gitanalytics)
```yaml
id:
  user: 1

exclude_branches:
  - "^(?!.*origin/).*$"
  - "origin/cherry-pick-*"

host:
  domain: "http://localhost"
  port: 8080
```

### Server Configuration
- Environment variables for Hasura connection
- Port configuration (default: 8080)
- CORS settings

## API Contract

### Request Format
```json
{
  "user_id": "uuid",
  "company_id": "uuid",
  "project_id": "uuid",
  "commits": [...],
  "branches": [...],
  "contributors": [...],
  "file_extensions": [...],
  "churn_metrics": [...],
  "most_updated_files": [...]
}
```

### Response Format
```json
{
  "status": "success",
  "message": "Analytics data ingested successfully",
  "stats": {
    "commits": 245,
    "branches": 8,
    "contributors": 12,
    "file_extensions": 15,
    "churn_metrics": 34,
    "most_updated_files": 50
  }
}
```

## Database Schema

See `docs/db_design.dbml` for complete schema.

Key tables:
- `git_commits`: Stores all commit data
- `git_branches`: Branch information and health
- `file_extension_stats`: File type statistics
- `churn_metrics`: Code churn analysis
- `projects`: Project metadata

## Security Considerations

1. **Authentication**: Currently not implemented (TODO)
2. **Authorization**: Relies on user_id and company_id
3. **Data Validation**: Server validates all incoming data
4. **SQL Injection**: Protected by Hasura's parameterized queries

## Performance Considerations

1. **Batch Inserts**: All data inserted in batches
2. **Conflict Handling**: Upserts for idempotency
3. **Timeouts**: 30-second HTTP timeout
4. **Memory**: Processes all commits in memory (consider streaming for large repos)

## Future Enhancements

1. Add authentication/authorization
2. Support incremental updates (only new commits)
3. Add progress reporting for large repositories
4. Support multiple project analysis
5. Add caching for repeated analyses
6. Implement webhook notifications

