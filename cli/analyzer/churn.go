package analyzer

import (
	"fmt"
	"strings"

	"gitanalytics-cli/models"

	"github.com/go-git/go-git/v5"
	"github.com/go-git/go-git/v5/plumbing"
	"github.com/go-git/go-git/v5/plumbing/object"
)

// calculateChurnMetrics calculates code churn using git blame
func calculateChurnMetrics(repo *git.Repository, branchNames []string) ([]models.ChurnMetric, error) {
	churnMetrics := make([]models.ChurnMetric, 0)

	// For simplicity, we'll analyze the main/master branch
	var mainBranch string
	for _, branch := range branchNames {
		if branch == "main" || branch == "master" {
			mainBranch = branch
			break
		}
	}

	if mainBranch == "" && len(branchNames) > 0 {
		mainBranch = branchNames[0] // Use first branch as fallback
	}

	if mainBranch == "" {
		return churnMetrics, nil
	}

	ref, err := repo.Reference(plumbing.NewBranchReferenceName(mainBranch), true)
	if err != nil {
		return churnMetrics, err
	}

	// Get recent commits (last 100 for performance)
	commitIter, err := repo.Log(&git.LogOptions{From: ref.Hash()})
	if err != nil {
		return churnMetrics, err
	}

	commitCount := 0
	maxCommits := 100

	err = commitIter.ForEach(func(commit *object.Commit) error {
		if commitCount >= maxCommits {
			return fmt.Errorf("reached max commits")
		}
		commitCount++

		// Get parent commit
		if commit.NumParents() == 0 {
			return nil
		}

		parent, err := commit.Parent(0)
		if err != nil {
			return nil
		}

		// Get diff between parent and current commit
		patch, err := parent.Patch(commit)
		if err != nil {
			return nil
		}

		// Analyze each file in the patch
		for _, filePatch := range patch.FilePatches() {
			from, to := filePatch.Files()
			if from == nil || to == nil {
				continue
			}

			filePath := to.Path()

			// Count deleted lines
			linesDeleted := 0
			for _, chunk := range filePatch.Chunks() {
				content := chunk.Content()
				lines := strings.Split(content, "\n")

				for _, line := range lines {
					if strings.HasPrefix(line, "-") && !strings.HasPrefix(line, "---") {
						linesDeleted++
					}
				}
			}

			// Only record significant churn (more than 5 lines)
			if linesDeleted >= 5 {
				victimEmail := parent.Author.Email
				if victimEmail != commit.Author.Email {
					churnMetrics = append(churnMetrics, models.ChurnMetric{
						CommitHash:       commit.Hash.String(),
						PerpetratorEmail: commit.Author.Email,
						VictimEmail:      victimEmail,
						LinesOverwritten: linesDeleted,
						FilePath:         filePath,
					})
				}
			}
		}

		return nil
	})

	if err != nil && err.Error() != "reached max commits" {
		return churnMetrics, err
	}

	return churnMetrics, nil
}
