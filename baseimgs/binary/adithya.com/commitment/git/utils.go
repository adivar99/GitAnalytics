package git

import (
	"fmt"
	"log"
	"time"

	"gopkg.in/src-d/go-git.v4"
	"gopkg.in/src-d/go-git.v4/plumbing"
	"gopkg.in/src-d/go-git.v4/plumbing/object"
)

// GetRepositoryDetails retrieves details of the Git repository
func GetRepositoryDetails(repo *git.Repository) (*Repository, error) {
	// Retrieve repository configuration
	config, err := repo.Config()
	if err != nil {
		return nil, err
	}

	remoteConfig := config.Remotes["origin"]
	remoteURL := ""
	if len(remoteConfig.URLs) > 0 {
		remoteURL = remoteConfig.URLs[0]
	}

	return &Repository{
		Created:   getRepositoryCreationDate(repo),
		RemoteURL: remoteURL,
	}, nil
}

// getRepositoryCreationDate retrieves the creation date of the repository
func getRepositoryCreationDate(repo *git.Repository) time.Time {
	ref, err := repo.Head()
	if err != nil {
		log.Printf("Error getting HEAD reference: %v\n", err)
		return time.Time{}
	}

	commit, err := repo.CommitObject(ref.Hash())
	if err != nil {
		log.Printf("Error getting commit object: %v\n", err)
		return time.Time{}
	}

	return commit.Author.When
}

// getLastNCommits retrieves details of the last N commits
func getLastNCommits(iter object.CommitIter, n int) ([]Commit, error) {
	var lastNCommits []Commit
	counter := 0

	err := iter.ForEach(func(c *object.Commit) error {
		if counter < n {
			commits := Commit{
				Name:        c.Author.Name,
				Email:       c.Author.Email,
				Hash:        c.Hash.String(),
				Message:     c.Message,
				Description: c.Message,
				Created:     c.Author.When,
			}
			lastNCommits = append(lastNCommits, commits)
			counter++
		} else {
			return fmt.Errorf("finished fetching last %d commits", n)
		}
		return nil
	})

	return lastNCommits, err
}

// getBranchCreationDate retrieves the creation date of a branch
func getBranchCreationDate(repo *git.Repository, branchName string) (time.Time, error) {
	ref, err := repo.Reference(plumbing.ReferenceName(fmt.Sprintf("refs/heads/%s", branchName)), true)
	if err != nil {
		return time.Time{}, err
	}

	commit, err := repo.CommitObject(ref.Hash())
	if err != nil {
		return time.Time{}, err
	}

	return commit.Author.When, nil
}
