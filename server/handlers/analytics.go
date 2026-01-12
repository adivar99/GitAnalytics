package handlers

import (
	"encoding/json"
	"fmt"
	"io"
	"log"
	"net/http"
	"time"

	"gitanalytics/server/pkg/hasura"
)

// AnalyticsData represents the incoming analytics payload from CLI
type AnalyticsData struct {
	UserID           string           `json:"user_id"`
	ProjectID        string           `json:"project_id"`
	Commits          []GitCommit      `json:"commits"`
	Branches         []GitBranch      `json:"branches"`
	Contributors     []Contributor    `json:"contributors"`
	FileExtensions   []FileExtension  `json:"file_extensions"`
	ChurnMetrics     []ChurnMetric    `json:"churn_metrics"`
	MostUpdatedFiles []FileUpdateStat `json:"most_updated_files"`
}

type GitCommit struct {
	Hash         string    `json:"hash"`
	AuthorName   string    `json:"author_name"`
	AuthorEmail  string    `json:"author_email"`
	Message      string    `json:"message"`
	BranchName   string    `json:"branch_name"`
	CommittedAt  time.Time `json:"committed_at"`
	FilesChanged []string  `json:"files_changed,omitempty"`
}

type GitBranch struct {
	Name            string    `json:"name"`
	LastCommitHash  string    `json:"last_commit_hash"`
	HealthStatus    string    `json:"health_status"`
	LastActivityAt  time.Time `json:"last_activity_at"`
	CommitCount     int       `json:"commit_count"`
	DaysSinceUpdate int       `json:"days_since_update"`
}

type Contributor struct {
	Name         string `json:"name"`
	Email        string `json:"email"`
	CommitCount  int    `json:"commit_count"`
	LinesAdded   int    `json:"lines_added"`
	LinesDeleted int    `json:"lines_deleted"`
	FilesChanged int    `json:"files_changed"`
}

type FileExtension struct {
	Extension    string `json:"extension"`
	Count        int    `json:"count"`
	TotalChanges int    `json:"total_changes"`
}

type ChurnMetric struct {
	PerpetratorEmail string `json:"perpetrator_email"`
	VictimEmail      string `json:"victim_email"`
	LinesOverwritten int    `json:"lines_overwritten"`
	FilePath         string `json:"file_path"`
	CommitHash       string `json:"commit_hash"`
}

type FileUpdateStat struct {
	FilePath     string    `json:"file_path"`
	UpdateCount  int       `json:"update_count"`
	Contributors int       `json:"contributors"`
	LastUpdated  time.Time `json:"last_updated"`
}

// AnalyticsHandler handles the analytics ingestion endpoint
type AnalyticsHandler struct {
	HasuraClient *hasura.Client
}

// NewAnalyticsHandler creates a new analytics handler
func NewAnalyticsHandler(hasuraClient *hasura.Client) *AnalyticsHandler {
	return &AnalyticsHandler{
		HasuraClient: hasuraClient,
	}
}

// IngestAnalytics handles POST /ingest
func (h *AnalyticsHandler) IngestAnalytics(w http.ResponseWriter, r *http.Request) {
	// Start timing the request
	startTime := time.Now()

	// Log incoming request
	log.Printf("[INGEST] New request received from %s", r.RemoteAddr)

	if r.Method != http.MethodPost {
		log.Printf("[INGEST] Method not allowed: %s", r.Method)
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		return
	}

	// Read request body
	body, err := io.ReadAll(r.Body)
	if err != nil {
		log.Printf("[INGEST] Error reading request body: %v", err)
		http.Error(w, "Failed to read request body", http.StatusBadRequest)
		return
	}
	defer r.Body.Close()

	log.Printf("[INGEST] Request body size: %d bytes", len(body))

	// Parse JSON
	var data AnalyticsData
	if err := json.Unmarshal(body, &data); err != nil {
		log.Printf("[INGEST] Error parsing JSON: %v", err)
		http.Error(w, "Invalid JSON format", http.StatusBadRequest)
		return
	}

	// Validate required fields
	if data.UserID == "" || data.ProjectID == "" {
		log.Printf("[INGEST] Missing required fields: user_id=%s, project_id=%s", data.UserID, data.ProjectID)
		http.Error(w, "user_id and project_id are required", http.StatusBadRequest)
		return
	}

	log.Printf("[INGEST] Received analytics data for user=%s, project=%s: %d commits, %d branches, %d contributors, %d file_extensions, %d churn_metrics",
		data.UserID, data.ProjectID, len(data.Commits), len(data.Branches), len(data.Contributors), len(data.FileExtensions), len(data.ChurnMetrics))

	// Process and store data
	processingStart := time.Now()
	if err := h.processAnalytics(&data); err != nil {
		log.Printf("[INGEST] Error processing analytics: %v (processing time: %v)", err, time.Since(processingStart))
		http.Error(w, fmt.Sprintf("Failed to process analytics: %v", err), http.StatusInternalServerError)
		return
	}
	processingDuration := time.Since(processingStart)
	log.Printf("[INGEST] Analytics processing completed in %v", processingDuration)

	// Send success response
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(map[string]interface{}{
		"status":  "success",
		"message": "Analytics data ingested successfully",
		"stats": map[string]int{
			"commits":            len(data.Commits),
			"branches":           len(data.Branches),
			"contributors":       len(data.Contributors),
			"file_extensions":    len(data.FileExtensions),
			"churn_metrics":      len(data.ChurnMetrics),
			"most_updated_files": len(data.MostUpdatedFiles),
		},
	})

	// Log total request duration
	totalDuration := time.Since(startTime)
	log.Printf("[INGEST] Request completed successfully in %v (processing: %v, overhead: %v)",
		totalDuration, processingDuration, totalDuration-processingDuration)
}

// processAnalytics processes and stores analytics data in the database
func (h *AnalyticsHandler) processAnalytics(data *AnalyticsData) error {
	// Get or determine project_id
	projectID := data.ProjectID
	if projectID == "" {
		// If no project_id provided, we need to find or create a default project
		// For now, we'll skip this and require project_id
		log.Printf("[INGEST] Warning: No project_id provided, data will be stored without project association")
	}

	// Insert commits
	if err := h.insertCommits(data.Commits, projectID); err != nil {
		return fmt.Errorf("failed to insert commits: %w", err)
	}

	// Insert branches
	if err := h.insertBranches(data.Branches, projectID); err != nil {
		return fmt.Errorf("failed to insert branches: %w", err)
	}

	// Insert file extension stats
	if err := h.insertFileExtensionStats(data.FileExtensions, data.Commits); err != nil {
		return fmt.Errorf("failed to insert file extension stats: %w", err)
	}

	// Insert churn metrics
	if err := h.insertChurnMetrics(data.ChurnMetrics, projectID); err != nil {
		return fmt.Errorf("failed to insert churn metrics: %w", err)
	}

	return nil
}

// insertCommits inserts git commits into the database
func (h *AnalyticsHandler) insertCommits(commits []GitCommit, projectID string) error {
	if len(commits) == 0 {
		return nil
	}

	// Prepare commits for batch insert
	commitObjects := make([]map[string]interface{}, 0, len(commits))
	for _, commit := range commits {
		commitObjects = append(commitObjects, map[string]interface{}{
			"hash":         commit.Hash,
			"project_id":   projectID,
			"author_name":  commit.AuthorName,
			"author_email": commit.AuthorEmail,
			"message":      commit.Message,
			"branch_name":  commit.BranchName,
			"committed_at": commit.CommittedAt,
		})
	}

	// Insert commits using Hasura
	mutation := `
		mutation InsertCommits($objects: [git_commits_insert_input!]!) {
			insert_git_commits(
				objects: $objects,
				on_conflict: {
					constraint: git_commits_pkey,
					update_columns: []
				}
			) {
				affected_rows
			}
		}
	`

	var result struct {
		InsertGitCommits struct {
			AffectedRows int `json:"affected_rows"`
		} `json:"insert_git_commits"`
	}

	log.Printf("[COMMITS] Inserting %d commits for project %s", len(commitObjects), projectID)

	if err := h.HasuraClient.Request(mutation, map[string]interface{}{
		"objects": commitObjects,
	}, &result); err != nil {
		log.Printf("[COMMITS] Error inserting commits: %v", err)
		return err
	}

	log.Printf("[COMMITS] Successfully inserted/updated %d commits", result.InsertGitCommits.AffectedRows)
	return nil
}

// insertBranches inserts git branches into the database
func (h *AnalyticsHandler) insertBranches(branches []GitBranch, projectID string) error {
	if len(branches) == 0 {
		return nil
	}

	branchObjects := make([]map[string]interface{}, 0, len(branches))
	for _, branch := range branches {
		branchObjects = append(branchObjects, map[string]interface{}{
			"project_id":       projectID,
			"name":             branch.Name,
			"last_commit_hash": branch.LastCommitHash,
			"health_status":    branch.HealthStatus,
			"last_activity_at": branch.LastActivityAt,
		})
	}

	// Now insert new branches
	mutation := `
		mutation InsertBranches($objects: [git_branches_insert_input!]!) {
			insert_git_branches(
				objects: $objects,
				on_conflict: {
					constraint: git_branches_project_id_name_key,
					update_columns: [last_commit_hash, health_status, last_activity_at]
				}
			) {
				affected_rows
			}
		}
	`

	var result struct {
		InsertGitBranches struct {
			AffectedRows int `json:"affected_rows"`
		} `json:"insert_git_branches"`
	}

	log.Printf("[BRANCHES] Inserting %d branches for project %s", len(branchObjects), projectID)

	if err := h.HasuraClient.Request(mutation, map[string]interface{}{
		"objects": branchObjects,
	}, &result); err != nil {
		log.Printf("[BRANCHES] Error inserting branches: %v", err)
		return err
	}

	log.Printf("[BRANCHES] Successfully inserted %d branches", result.InsertGitBranches.AffectedRows)
	return nil
}

// insertFileExtensionStats inserts file extension statistics
func (h *AnalyticsHandler) insertFileExtensionStats(extensions []FileExtension, commits []GitCommit) error {
	if len(extensions) == 0 || len(commits) == 0 {
		return nil
	}

	// For simplicity, associate extensions with the most recent commit
	var latestCommitHash string
	if len(commits) > 0 {
		latestCommitHash = commits[0].Hash
	}

	extObjects := make([]map[string]interface{}, 0, len(extensions))
	for _, ext := range extensions {
		extObjects = append(extObjects, map[string]interface{}{
			"commit_hash": latestCommitHash,
			"extension":   ext.Extension,
			"count":       ext.Count,
		})
	}

	mutation := `
		mutation InsertFileExtensions($objects: [file_extension_stats_insert_input!]!) {
			insert_file_extension_stats(objects: $objects) {
				affected_rows
			}
		}
	`

	var result struct {
		InsertFileExtensionStats struct {
			AffectedRows int `json:"affected_rows"`
		} `json:"insert_file_extension_stats"`
	}

	log.Printf("[FILE_EXTENSIONS] Inserting %d file extension stats (commit: %s)", len(extObjects), latestCommitHash)

	if err := h.HasuraClient.Request(mutation, map[string]interface{}{
		"objects": extObjects,
	}, &result); err != nil {
		log.Printf("[FILE_EXTENSIONS] Error inserting file extension stats: %v", err)
		return err
	}

	log.Printf("[FILE_EXTENSIONS] Successfully inserted %d file extension stats", result.InsertFileExtensionStats.AffectedRows)
	return nil
}

// insertChurnMetrics inserts code churn metrics
func (h *AnalyticsHandler) insertChurnMetrics(metrics []ChurnMetric, projectID string) error {
	if len(metrics) == 0 {
		return nil
	}

	churnObjects := make([]map[string]interface{}, 0, len(metrics))
	for _, metric := range metrics {
		churnObjects = append(churnObjects, map[string]interface{}{
			"commit_hash":       metric.CommitHash,
			"project_id":        projectID,
			"perpetrator_email": metric.PerpetratorEmail,
			"victim_email":      metric.VictimEmail,
			"lines_overwritten": metric.LinesOverwritten,
		})
	}

	mutation := `
		mutation InsertChurnMetrics($objects: [churn_metrics_insert_input!]!) {
			insert_churn_metrics(objects: $objects) {
				affected_rows
			}
		}
	`

	var result struct {
		InsertChurnMetrics struct {
			AffectedRows int `json:"affected_rows"`
		} `json:"insert_churn_metrics"`
	}

	log.Printf("[CHURN_METRICS] Inserting %d churn metrics for project %s", len(churnObjects), projectID)

	if err := h.HasuraClient.Request(mutation, map[string]interface{}{
		"objects": churnObjects,
	}, &result); err != nil {
		log.Printf("[CHURN_METRICS] Error inserting churn metrics: %v", err)
		return err
	}

	log.Printf("[CHURN_METRICS] Successfully inserted %d churn metrics", result.InsertChurnMetrics.AffectedRows)
	return nil
}
