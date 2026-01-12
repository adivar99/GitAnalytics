package analyzer

import (
	"fmt"
	"regexp"

	"gitanalytics-cli/models"

	"github.com/go-git/go-git/v5"
	"github.com/go-git/go-git/v5/plumbing"
	"github.com/go-git/go-git/v5/plumbing/object"
)

// AnalyzeRepository performs complete git analysis on a repository
func AnalyzeRepository(
	repoPath string,
	excludeBranchPatterns []string,
	excludeFilePatterns []string,
) (*models.AnalyticsData, error) {
	repo, err := git.PlainOpen(repoPath)
	if err != nil {
		return nil, fmt.Errorf("failed to open repository: %w", err)
	}

	// Compile exclude branch patterns
	excludeBranchRegexes := make([]*regexp.Regexp, 0, len(excludeBranchPatterns))
	for _, pattern := range excludeBranchPatterns {
		re, err := regexp.Compile(pattern)
		if err != nil {
			return nil, fmt.Errorf("invalid exclude branch pattern '%s': %w", pattern, err)
		}
		excludeBranchRegexes = append(excludeBranchRegexes, re)
	}

	// Compile exclude file patterns
	excludeFileRegexes := make([]*regexp.Regexp, 0, len(excludeFilePatterns))
	for _, pattern := range excludeFilePatterns {
		re, err := regexp.Compile(pattern)
		if err != nil {
			return nil, fmt.Errorf("invalid exclude file pattern '%s': %w", pattern, err)
		}
		excludeFileRegexes = append(excludeFileRegexes, re)
	}

	data := &models.AnalyticsData{
		Commits:          make([]models.GitCommit, 0),
		Branches:         make([]models.GitBranch, 0),
		Contributors:     make([]models.Contributor, 0),
		FileExtensions:   make([]models.FileExtension, 0),
		ChurnMetrics:     make([]models.ChurnMetric, 0),
		MostUpdatedFiles: make([]models.FileUpdateStat, 0),
	}

	// Get all branches
	branches, err := repo.Branches()
	if err != nil {
		return nil, fmt.Errorf("failed to get branches: %w", err)
	}

	branchNames := make([]string, 0)
	err = branches.ForEach(func(ref *plumbing.Reference) error {
		branchName := ref.Name().Short()

		// Check if branch should be excluded
		excluded := false
		for _, re := range excludeBranchRegexes {
			if re.MatchString(branchName) {
				excluded = true
				break
			}
		}

		if !excluded {
			branchNames = append(branchNames, branchName)
		}
		return nil
	})
	if err != nil {
		return nil, fmt.Errorf("failed to iterate branches: %w", err)
	}

	// Analyze commits from all non-excluded branches
	commitMap := make(map[string]*models.GitCommit)
	contributorMap := make(map[string]*models.Contributor)
	fileExtMap := make(map[string]*models.FileExtension)
	fileUpdateMap := make(map[string]*models.FileUpdateStat)

	for _, branchName := range branchNames {
		if err := analyzeBranch(repo, branchName, commitMap, contributorMap, fileExtMap, fileUpdateMap, excludeFileRegexes); err != nil {
			fmt.Printf("Warning: failed to analyze branch %s: %v\n", branchName, err)
			continue
		}
	}

	// Convert maps to slices
	for _, commit := range commitMap {
		data.Commits = append(data.Commits, *commit)
	}
	for _, contributor := range contributorMap {
		data.Contributors = append(data.Contributors, *contributor)
	}
	for _, ext := range fileExtMap {
		data.FileExtensions = append(data.FileExtensions, *ext)
	}
	for _, file := range fileUpdateMap {
		data.MostUpdatedFiles = append(data.MostUpdatedFiles, *file)
	}

	// Analyze branches for health status
	data.Branches, err = analyzeBranchHealth(repo, branchNames)
	if err != nil {
		return nil, fmt.Errorf("failed to analyze branch health: %w", err)
	}

	// Calculate churn metrics
	data.ChurnMetrics, err = calculateChurnMetrics(repo, branchNames)
	if err != nil {
		fmt.Printf("Warning: failed to calculate churn metrics: %v\n", err)
		// Continue without churn metrics
	}

	return data, nil
}

func analyzeBranch(
	repo *git.Repository,
	branchName string,
	commitMap map[string]*models.GitCommit,
	contributorMap map[string]*models.Contributor,
	fileExtMap map[string]*models.FileExtension,
	fileUpdateMap map[string]*models.FileUpdateStat,
	excludeFileRegexes []*regexp.Regexp,
) error {

	ref, err := repo.Reference(plumbing.NewBranchReferenceName(branchName), true)
	if err != nil {
		return err
	}

	commitIter, err := repo.Log(&git.LogOptions{From: ref.Hash()})
	if err != nil {
		return err
	}

	err = commitIter.ForEach(func(c *object.Commit) error {
		hash := c.Hash.String()

		// Add commit if not already processed
		if _, exists := commitMap[hash]; !exists {
			commitMap[hash] = &models.GitCommit{
				Hash:        hash,
				AuthorName:  c.Author.Name,
				AuthorEmail: c.Author.Email,
				Message:     c.Message,
				BranchName:  branchName,
				CommittedAt: c.Author.When,
			}
		}

		// Update contributor stats
		email := c.Author.Email
		if _, exists := contributorMap[email]; !exists {
			contributorMap[email] = &models.Contributor{
				Name:  c.Author.Name,
				Email: email,
			}
		}
		contributorMap[email].CommitCount++

		// Analyze file changes with exclusion filtering
		analyzeCommitFiles(c, contributorMap[email], fileExtMap, fileUpdateMap, excludeFileRegexes)

		return nil
	})

	return err
}
