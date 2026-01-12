# GitAnalytics CLI

A command-line tool that analyzes git repositories and sends comprehensive analytics data to the GitAnalytics server.

## Features

The CLI extracts and analyzes:

- **Top Contributors**: Commit counts, lines added/deleted, files changed per contributor
- **File Extensions**: Most commonly updated file types and their change frequency
- **Most Updated Files**: Files with the highest number of updates and contributors
- **Code Churn Metrics**: Who overwrote whose code and by how much
- **Branch Health**: Categorizes branches as HOT, STABLE, or STALE based on activity

## Installation

### Prerequisites

- Go 1.21 or higher
- Git installed on your system

### Build from Source

```bash
cd cli
make deps    # Install dependencies
make build   # Build the binary
```

The binary will be created in `bin/gitanalytics-cli`.

### Install to System

```bash
make install
```

This installs the binary to `$GOPATH/bin`.

## Quick Start

### 1. Download Configuration from Web UI

The easiest way to get started is to download a pre-configured `.gitanalytics` file from the GitAnalytics web interface:

1. Navigate to your project page in the GitAnalytics dashboard
2. Click the **"Download CLI Config"** button
3. Move the downloaded `.gitanalytics` file to the root of your git repository

The file will be pre-populated with your user and project IDs!

### 2. Run the CLI

```bash
gitanalytics-cli
```

That's it! The CLI will automatically read the `.gitanalytics` file and send analytics to your project.

## Usage

### Basic Usage

```bash
gitanalytics-cli --user-id <USER_ID> --project-id <PROJECT_ID>
```

### Command-Line Options

```
Flags:
  -r, --repo string                Path to the git repository (default: current directory)
  -H, --host string                Server host (e.g., http://localhost)
  -p, --port int                   Server port (default: 8080)
  -u, --user-id string             User ID (required)
  -c, --company-id string          Company ID (required)
  -e, --exclude-branches strings   Branch patterns to exclude (comma-separated regex)
  -h, --help                       Help for gitanalytics-cli
```

### Examples

**Analyze current repository:**
```bash
gitanalytics-cli --user-id user123 --company-id company456
```

**Analyze specific repository:**
```bash
gitanalytics-cli -r /path/to/repo --user-id user123 --company-id company456
```

**Custom server endpoint:**
```bash
gitanalytics-cli --user-id user123 --company-id company456 --host http://10.37.140.7 --port 80
```

**Exclude specific branches:**
```bash
gitanalytics-cli --user-id user123 --company-id company456 \
  --exclude-branches "^(?!.*origin/).*$,origin/cherry-pick-*"
```

## Configuration File

The CLI can read default configuration from a `.gitanalytics` YAML file in the repository root:

```yaml
id:
  user: 1

exclude_branches:
  - "^(?!.*origin/).*$"
  - "origin/cherry-pick-*"

functions:
  - "churn"
  - "file_extensions"

host:
  domain: "http://10.37.140.7"
  port: 80
```

**Note:** Command-line arguments take precedence over configuration file values.

## Data Structure

The CLI sends a JSON payload with the following structure:

```json
{
  "user_id": "string",
  "company_id": "string",
  "commits": [...],
  "branches": [...],
  "contributors": [...],
  "file_extensions": [...],
  "churn_metrics": [...],
  "most_updated_files": [...]
}
```

## Server Endpoint

The CLI sends data to: `POST {host}:{port}/api/analytics/ingest`

Make sure your GitAnalytics server is running and has this endpoint configured.

## Development

### Run Tests
```bash
make test
```

### Build for Multiple Platforms
```bash
make build-all
```

This creates binaries for:
- Linux (amd64)
- macOS (amd64, arm64)
- Windows (amd64)

### Clean Build Artifacts
```bash
make clean
```

## Troubleshooting

**Error: "failed to open repository"**
- Ensure the path points to a valid git repository
- Check that you have read permissions

**Error: "user-id is required"**
- Provide `--user-id` flag or set it in `.gitanalytics` config

**Error: "failed to send data to server"**
- Verify the server is running on the specified host and port
- Check network connectivity
- Ensure the `/api/analytics/ingest` endpoint exists

## License

Part of the GitAnalytics project.

