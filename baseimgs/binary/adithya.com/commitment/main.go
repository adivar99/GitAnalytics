package main

import (
	"encoding/json"
	"fmt"
	"log"
	"os"
	"path/filepath"

	"adithya.com/commitment/git"
	"adithya.com/commitment/http"
)

func getRepositoryPath() (string, error) {
	currentDir, err := os.Getwd()
	if err != nil {
		return "", err
	}

	// Search for the .git directory in the parent directories
	gitPath := filepath.Join(currentDir, ".git")
	for !isDirectory(gitPath) {
		parentDir := filepath.Dir(currentDir)
		if parentDir == currentDir {
			// Reached the root directory without finding .git
			return "", fmt.Errorf(".git directory not found")
		}
		currentDir = parentDir
		gitPath = filepath.Join(currentDir, ".git")
	}

	return currentDir, nil
}

func isDirectory(path string) bool {
	fileInfo, err := os.Stat(path)
	if err != nil {
		return false
	}
	return fileInfo.IsDir()
}
func main() {
	repoPath, err := getRepositoryPath()
	if err != nil {
		log.Fatalf("Could not retrieve current git directory: %v", err)
	}

	repoDetails, err := git.GetMasterBranchDetails(repoPath)
	if err != nil {
		log.Fatalf("Could not retrieve repository details: %v", err)
	}

	// fmt.Printf("Repository Name: %s\n", repoDetails.Name)
	// fmt.Printf("Repository Created At: %v\n", repoDetails.Created)
	// fmt.Printf("Repository Remote URL: %s\n", repoDetails.RemoteURL)

	// fmt.Println("Master Branch Details:")
	// for _, commit := range repoDetails.MasterCommits {
	// 	fmt.Printf("  - Author: %s <%s>\n", commit.Name, commit.Email)
	// 	fmt.Printf("    Commit Hash: %s\n", commit.Hash)
	// 	fmt.Printf("    Commit Message: %s\n", commit.Message)
	// 	fmt.Printf("    Commit Created: %s\n", commit.Created)
	// }

	jsonData, err := json.Marshal(repoDetails)
	if err != nil {
		log.Fatalf("Could not Marshal Json data: %v", err)
	}

	log.Println("Sending master info to agent")
	apiClient := http.NewAPIClient("http://localhost", "aefwwefwef")
	resp, err := apiClient.SendMasterInfo(jsonData)
	if err != nil {
		log.Fatalf("Error Sending Master info data: %v", err)
	}
	log.Print(resp)
}
