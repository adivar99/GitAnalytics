package cmd

import (
	"encoding/json"
	"fmt"
	"os"
	"strings"

	"gitanalytics-cli/analyzer"
	"gitanalytics-cli/client"
	"gitanalytics-cli/config"

	"github.com/spf13/cobra"
)

var (
	repoPath        string
	host            string
	port            int
	userID          string
	projectID       string
	excludeBranches []string
	excludeFiles    []string
)

var rootCmd = &cobra.Command{
	Use:   "gitanalytics-cli",
	Short: "Git Analytics CLI - Analyze git repositories and send metrics to server",
	Long: `A CLI tool that analyzes git repositories to extract:
- Top contributors
- File extension statistics
- Most updated files
- Code churn metrics
- Branch health status

The data is structured into JSON and sent to the GitAnalytics server.`,
	RunE: runAnalysis,
}

func init() {
	rootCmd.Flags().StringVarP(&repoPath, "repo", "r", ".", "Path to the git repository")
	rootCmd.Flags().StringVarP(&host, "host", "H", "", "Server host (e.g., http://localhost)")
	rootCmd.Flags().IntVarP(&port, "port", "p", 8081, "Server port (default: 8081)")
	rootCmd.Flags().StringVarP(&userID, "user-id", "u", "", "User ID")
	rootCmd.Flags().StringVarP(&projectID, "project-id", "P", "", "Project ID")
	rootCmd.Flags().StringSliceVarP(&excludeBranches, "exclude-branches", "e", []string{}, "Branch patterns to exclude (comma-separated)")
	rootCmd.Flags().StringSliceVarP(&excludeFiles, "exclude-files", "f", []string{}, "File/directory patterns to exclude (comma-separated regex)")
}

func Execute() error {
	return rootCmd.Execute()
}

func runAnalysis(cmd *cobra.Command, args []string) error {
	// Load config from .gitanalytics file if it exists
	cfg, err := config.LoadConfig(repoPath)
	if err != nil {
		fmt.Fprintf(os.Stderr, "Warning: Could not load .gitanalytics config: %v\n", err)
		cfg = &config.Config{} // Use empty config
	}

	// Merge CLI options with config
	opts := &config.CLIOptions{
		RepoPath:        repoPath,
		Host:            host,
		Port:            port,
		UserID:          userID,
		ProjectID:       projectID,
		ExcludeBranches: excludeBranches,
		ExcludeFiles:    excludeFiles,
	}
	opts.MergeWithConfig(cfg)

	// Set defaults
	if opts.Port == 0 {
		opts.Port = 8081
	}
	if opts.Host == "" {
		opts.Host = "http://localhost"
	}

	// Validate required fields
	if opts.UserID == "" {
		return fmt.Errorf("user-id is required (use --user-id flag or set in .gitanalytics)")
	}
	if opts.ProjectID == "" {
		return fmt.Errorf("project-id is required (use --project-id flag or set in .gitanalytics)")
	}

	fmt.Printf("Analyzing repository at: %s\n", opts.RepoPath)
	fmt.Printf("Server: %s:%d\n", opts.Host, opts.Port)
	if len(opts.ExcludeBranches) > 0 {
		fmt.Printf("Excluding branches: %s\n", strings.Join(opts.ExcludeBranches, ", "))
	}
	if len(opts.ExcludeFiles) > 0 {
		fmt.Printf("Excluding files/directories: %s\n", strings.Join(opts.ExcludeFiles, ", "))
	}

	// Analyze the repository
	fmt.Println("\nAnalyzing git repository...")
	data, err := analyzer.AnalyzeRepository(opts.RepoPath, opts.ExcludeBranches, opts.ExcludeFiles)
	if err != nil {
		return fmt.Errorf("failed to analyze repository: %w", err)
	}

	// Set metadata
	data.UserID = opts.UserID
	data.ProjectID = opts.ProjectID

	fmt.Printf("\nAnalysis complete:\n")
	fmt.Printf("  - Commits: %d\n", len(data.Commits))
	fmt.Printf("  - Branches: %d\n", len(data.Branches))
	fmt.Printf("  - Contributors: %d\n", len(data.Contributors))
	fmt.Printf("  - File Extensions: %d\n", len(data.FileExtensions))
	fmt.Printf("  - Churn Metrics: %d\n", len(data.ChurnMetrics))

	// Send data to server
	fmt.Printf("\nSending data to server: %s:%d\n", opts.Host, opts.Port)
	serverURL := fmt.Sprintf("%s:%d", opts.Host, opts.Port)

	// Write data to JSON file for debugging
	// if err := writeJSONToFile(data, "analytics_output.json"); err != nil {
	// 	return fmt.Errorf("failed to write JSON file: %w", err)
	// }

	fmt.Printf("Server URL: %s\n", serverURL)
	if err := client.SendAnalytics(serverURL, data); err != nil {
		return fmt.Errorf("failed to send data to server: %w", err)
	}

	fmt.Println("✓ Data sent successfully!")
	return nil
}

func writeJSONToFile(data interface{}, filename string) error {
	// Write data to JSON file for debugging
	jsonData, err := json.MarshalIndent(data, "", "  ")
	if err != nil {
		return fmt.Errorf("failed to marshal data to JSON: %w", err)
	}

	outputFile := "analytics_output.json"
	if err := os.WriteFile(outputFile, jsonData, 0644); err != nil {
		return fmt.Errorf("failed to write JSON file: %w", err)
	}

	fmt.Printf("✓ Analytics data written to %s\n", outputFile)
	return nil
}
