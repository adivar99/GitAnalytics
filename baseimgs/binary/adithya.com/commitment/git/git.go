package git

import (
	"log"
	"path/filepath"

	"gopkg.in/src-d/go-git.v4"
	"gopkg.in/src-d/go-git.v4/plumbing"
	"gopkg.in/src-d/go-git.v4/plumbing/object"
)

// GetMasterBranchDetails retrieves details of the master branch of a Git repository
func GetMasterBranchDetails(repoPath string) (*Repository, error) {
	// Open the Git repository
	repo, err := git.PlainOpen(repoPath)
	if err != nil {
		return nil, err
	}

	// Retrieve the HEAD reference (usually pointing to the master branch)
	ref, err := repo.Head()
	if err != nil {
		return nil, err
	}

	// Get repository details
	repoDetails, err := GetRepositoryDetails(repo)
	if err != nil {
		return nil, err
	}

	// Retrieve the commit object from the reference
	commit, err := repo.CommitObject(ref.Hash())
	if err != nil {
		log.Fatal("Error retrieving commit object:", err)
	}

	// Retrieve the commit history
	commitIter, err := repo.Log(&git.LogOptions{
		From: commit.Hash,
	})
	if err != nil {
		log.Fatal("Error getting commit history:", err)
	}

	// Iterate over the commit history
	var commitsList []Commit
	// Iterate over the commit history
	err = commitIter.ForEach(func(c *object.Commit) error {
		commits := Commit{
			Name:        c.Author.Name,
			Email:       c.Author.Email,
			Hash:        c.Hash.String(),
			Message:     c.Message,
			Description: c.Message,
			Created:     c.Author.When,
		}
		commitsList = append(commitsList, commits)
		return nil
	})
	if err != nil {
		return nil, err
	}

	repoDetails.Name = filepath.Base(repoPath)
	repoDetails.MasterCommits = commitsList
	return repoDetails, nil
}

// GetBranchDetails retrieves details for all branches in a Git repository
func GetBranchDetails(repoPath string) ([]Branch, error) {
	// Open the Git repository
	repo, err := git.PlainOpen(repoPath)
	if err != nil {
		return nil, err
	}

	// Retrieve all references (branches)
	refs, err := repo.References()
	if err != nil {
		return nil, err
	}

	var branchDetailsList []Branch

	// Iterate over branches
	err = refs.ForEach(func(ref *plumbing.Reference) error {
		if ref.Name().IsBranch() {
			// Retrieve the branch name
			branchName := ref.Name().Short()

			// Retrieve the commit history for the branch
			commitIter, err := repo.Log(&git.LogOptions{
				From: ref.Hash(),
			})
			if err != nil {
				log.Printf("Error getting commit history for branch %s: %v\n", branchName, err)
				return nil
			}

			// Count the number of commits
			commitsCount := 0
			_ = commitIter.ForEach(func(_ *object.Commit) error {
				commitsCount++
				return nil
			})

			// Retrieve details of the last 10 commits
			last10Commits, _ := getLastNCommits(commitIter, 10)

			// Retrieve the creation date of the branch
			branchCreationDate, _ := getBranchCreationDate(repo, branchName)

			// Create BranchDetails struct
			branchDetails := Branch{
				Name:         branchName,
				CommitsCount: commitsCount,
				LastCommits:  last10Commits,
				Created:      branchCreationDate,
			}

			// Append to the list
			branchDetailsList = append(branchDetailsList, branchDetails)
		}
		return nil
	})

	if err != nil {
		return nil, err
	}

	return branchDetailsList, nil
}
