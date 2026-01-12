package analyzer

import (
	"time"

	"gitanalytics-cli/models"

	"github.com/go-git/go-git/v5"
	"github.com/go-git/go-git/v5/plumbing"
	"github.com/go-git/go-git/v5/plumbing/object"
)

// analyzeBranchHealth analyzes branch health status
func analyzeBranchHealth(repo *git.Repository, branchNames []string) ([]models.GitBranch, error) {
	branches := make([]models.GitBranch, 0, len(branchNames))

	for _, branchName := range branchNames {
		ref, err := repo.Reference(plumbing.NewBranchReferenceName(branchName), true)
		if err != nil {
			continue
		}

		commit, err := repo.CommitObject(ref.Hash())
		if err != nil {
			continue
		}

		// Count commits in the last 30 days
		commitCount := 0
		lastActivityAt := commit.Author.When
		
		commitIter, err := repo.Log(&git.LogOptions{From: ref.Hash()})
		if err != nil {
			continue
		}

		thirtyDaysAgo := time.Now().AddDate(0, 0, -30)
		err = commitIter.ForEach(func(c *object.Commit) error {
			if c.Author.When.After(thirtyDaysAgo) {
				commitCount++
			}
			if c.Author.When.After(lastActivityAt) {
				lastActivityAt = c.Author.When
			}
			return nil
		})
		if err != nil {
			continue
		}

		// Calculate days since last update
		daysSinceUpdate := int(time.Since(lastActivityAt).Hours() / 24)

		// Determine health status
		healthStatus := determineHealthStatus(commitCount, daysSinceUpdate)

		branches = append(branches, models.GitBranch{
			Name:            branchName,
			LastCommitHash:  ref.Hash().String(),
			HealthStatus:    healthStatus,
			LastActivityAt:  lastActivityAt,
			CommitCount:     commitCount,
			DaysSinceUpdate: daysSinceUpdate,
		})
	}

	return branches, nil
}

// determineHealthStatus determines branch health based on activity
func determineHealthStatus(commitCount int, daysSinceUpdate int) string {
	// STALE: No commits in last 30 days
	if daysSinceUpdate > 30 {
		return models.BranchHealthStale
	}

	// HOT: High frequency (10+ commits in last 30 days)
	if commitCount >= 10 {
		return models.BranchHealthHot
	}

	// STABLE: Low frequency but recent commits
	return models.BranchHealthStable
}

