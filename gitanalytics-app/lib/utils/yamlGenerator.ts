/**
 * Generates a gitanalytics.yml YAML configuration file content
 * with user and project IDs pre-populated
 */
export function generateGitAnalyticsYaml(userId: string, projectId: string): string {
  return `# GitAnalytics CLI Configuration
# This file should be placed in the root of your git repository

# Required: User and Project IDs (auto-populated)
id:
  user: ${userId}
  project: ${projectId}

# Optional: Exclude specific branches from analysis
# Use regex patterns to match branch names
# exclude_branches:
#   - "^(?!.*origin/).*$"        # Exclude all non-origin branches
#   - "origin/cherry-pick-*"     # Exclude cherry-pick branches
#   - "origin/feature/.*"        # Exclude feature branches
#   - "origin/(dev|staging|test)" # Exclude specific branches

# Optional: Exclude specific files or directories from analysis
# Use regex patterns to match file paths
# exclude_files:
#   - "^vendor/"                 # Exclude vendor directory
#   - "^node_modules/"           # Exclude node_modules directory
#   - "\\.min\\.(js|css)$"       # Exclude minified files
#   - "^dist/"                   # Exclude dist/build directories
#   - "^build/"                  # Exclude build directories
#   - "\\.lock$"                 # Exclude lock files (package-lock.json, yarn.lock, etc.)
#   - "^test/"                   # Exclude test directories
#   - "^__tests__/"              # Exclude test directories

# Optional: Specify which analytics functions to run
# Available functions: churn, file_extensions, contributors, branches
# functions:
#   - "churn"
#   - "file_extensions"
#   - "contributors"
#   - "branches"

# Optional: Server configuration
# Default host and port are shown below
# host:
#   domain: "http://localhost"
#   port: 8081
`;
}

/**
 * Triggers a download of the YAML file in the browser
 */
export function downloadYamlFile(content: string, filename: string = 'gitanalytics.yml') {
  const blob = new Blob([content], { type: 'text/yaml;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

