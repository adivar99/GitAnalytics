package git

import "time"

// Commits represents the details of a Git commit
type Commit struct {
	Name        string    `json: "name"`
	Email       string    `json: "email"`
	Hash        string    `json: "hash"`
	Message     string    `json: "message"`
	Description string    `json: "description"`
	Created     time.Time `json: "created"`
}

// BranchDetails represents details for a Git branch
type Branch struct {
	Name         string    `json: "name"`
	CommitsCount int       `json: "commits_count"`
	LastCommits  []Commit  `json: "last_commits"`
	Created      time.Time `json: "created"`
}

// RepositoryDetails represents the details of a Git repository
type Repository struct {
	Name          string    `json: "name"`
	Created       time.Time `json: "created"`
	RemoteURL     string    `json: "remote"`
	MasterCommits []Commit  `json: master_commits`
}
