package analyzer

import (
	"path/filepath"
	"regexp"
	"strings"

	"gitanalytics-cli/models"

	"github.com/go-git/go-git/v5/plumbing/object"
)

// analyzeCommitFiles analyzes files changed in a commit
func analyzeCommitFiles(commit *object.Commit, contributor *models.Contributor,
	fileExtMap map[string]*models.FileExtension, fileUpdateMap map[string]*models.FileUpdateStat,
	excludeFileRegexes []*regexp.Regexp) {

	// Get file stats from commit
	stats, err := commit.Stats()
	if err != nil {
		return
	}

	filesChanged := make(map[string]bool)

	for _, stat := range stats {
		filePath := stat.Name

		// Check if file should be excluded
		excluded := false
		for _, re := range excludeFileRegexes {
			if re.MatchString(filePath) {
				excluded = true
				break
			}
		}
		if excluded {
			continue
		}

		filesChanged[filePath] = true

		// Track file extension
		ext := filepath.Ext(filePath)
		if ext == "" {
			ext = "no-extension"
		}
		if _, exists := fileExtMap[ext]; !exists {
			fileExtMap[ext] = &models.FileExtension{
				Extension: ext,
			}
		}
		fileExtMap[ext].Count++
		fileExtMap[ext].TotalChanges += stat.Addition + stat.Deletion

		// Track file updates
		if _, exists := fileUpdateMap[filePath]; !exists {
			fileUpdateMap[filePath] = &models.FileUpdateStat{
				FilePath:    filePath,
				LastUpdated: commit.Author.When,
			}
		}
		fileUpdateMap[filePath].UpdateCount++
		if commit.Author.When.After(fileUpdateMap[filePath].LastUpdated) {
			fileUpdateMap[filePath].LastUpdated = commit.Author.When
		}

		// Update contributor stats
		contributor.LinesAdded += stat.Addition
		contributor.LinesDeleted += stat.Deletion
	}

	contributor.FilesChanged += len(filesChanged)
}

// getFileExtension extracts file extension from path
func getFileExtension(path string) string {
	ext := filepath.Ext(path)
	if ext == "" {
		return "no-extension"
	}
	// Remove the leading dot
	return strings.TrimPrefix(ext, ".")
}
