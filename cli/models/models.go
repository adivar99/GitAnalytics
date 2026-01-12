package models

import "time"

// AnalyticsData represents the complete analytics payload to send to the server
type AnalyticsData struct {
	UserID           string           `json:"user_id"`
	CompanyID        string           `json:"company_id"`
	ProjectID        string           `json:"project_id,omitempty"`
	Commits          []GitCommit      `json:"commits"`
	Branches         []GitBranch      `json:"branches"`
	Contributors     []Contributor    `json:"contributors"`
	FileExtensions   []FileExtension  `json:"file_extensions"`
	ChurnMetrics     []ChurnMetric    `json:"churn_metrics"`
	MostUpdatedFiles []FileUpdateStat `json:"most_updated_files"`
}

// GitCommit represents a single commit
type GitCommit struct {
	Hash         string    `json:"hash"`
	AuthorName   string    `json:"author_name"`
	AuthorEmail  string    `json:"author_email"`
	Message      string    `json:"message"`
	BranchName   string    `json:"branch_name"`
	CommittedAt  time.Time `json:"committed_at"`
	FilesChanged []string  `json:"files_changed,omitempty"`
}

// GitBranch represents branch information and health
type GitBranch struct {
	Name            string    `json:"name"`
	LastCommitHash  string    `json:"last_commit_hash"`
	HealthStatus    string    `json:"health_status"` // HOT, STABLE, STALE
	LastActivityAt  time.Time `json:"last_activity_at"`
	CommitCount     int       `json:"commit_count"`
	DaysSinceUpdate int       `json:"days_since_update"`
}

// Contributor represents a contributor's statistics
type Contributor struct {
	Name         string `json:"name"`
	Email        string `json:"email"`
	CommitCount  int    `json:"commit_count"`
	LinesAdded   int    `json:"lines_added"`
	LinesDeleted int    `json:"lines_deleted"`
	FilesChanged int    `json:"files_changed"`
}

// FileExtension represents file extension statistics
type FileExtension struct {
	Extension    string `json:"extension"`
	Count        int    `json:"count"`
	TotalChanges int    `json:"total_changes"`
}

// ChurnMetric represents code churn between contributors
type ChurnMetric struct {
	PerpetratorEmail string `json:"perpetrator_email"`
	VictimEmail      string `json:"victim_email"`
	LinesOverwritten int    `json:"lines_overwritten"`
	FilePath         string `json:"file_path"`
	CommitHash       string `json:"commit_hash"`
}

// FileUpdateStat represents files that have been updated the most
type FileUpdateStat struct {
	FilePath     string    `json:"file_path"`
	UpdateCount  int       `json:"update_count"`
	Contributors int       `json:"contributors"`
	LastUpdated  time.Time `json:"last_updated"`
}

// BranchHealthStatus constants
const (
	BranchHealthHot    = "HOT"    // High frequency, recent commits
	BranchHealthStable = "STABLE" // Low frequency, recent commits
	BranchHealthStale  = "STALE"  // No recent commits
)
