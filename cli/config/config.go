package config

import (
	"fmt"
	"os"
	"path/filepath"

	"github.com/google/uuid"
	"gopkg.in/yaml.v3"
)

// Config represents the gitanalytics.yml YAML configuration
type Config struct {
	ID struct {
		User    uuid.UUID `yaml:"user"`
		Project uuid.UUID `yaml:"project"`
	} `yaml:"id"`
	ExcludeBranches []string `yaml:"exclude_branches"`
	ExcludeFiles    []string `yaml:"exclude_files"`
	Functions       []string `yaml:"functions"`
	Host            struct {
		Domain string `yaml:"domain"`
		Port   int    `yaml:"port"`
	} `yaml:"host"`
}

// LoadConfig loads the gitanalytics.yml file from the repository root
func LoadConfig(repoPath string) (*Config, error) {
	configPath := filepath.Join(repoPath, "gitanalytics.yml")

	data, err := os.ReadFile(configPath)
	if err != nil {
		return nil, fmt.Errorf("failed to read config file: %w", err)
	}

	var config Config
	if err := yaml.Unmarshal(data, &config); err != nil {
		return nil, fmt.Errorf("failed to parse config file: %w", err)
	}

	return &config, nil
}

// CLIOptions represents command-line arguments
type CLIOptions struct {
	RepoPath        string
	Host            string
	Port            int
	UserID          string
	ProjectID       string
	ExcludeBranches []string
	ExcludeFiles    []string
}

// MergeWithConfig merges CLI options with config file, CLI takes precedence
func (opts *CLIOptions) MergeWithConfig(config *Config) {
	if opts.UserID == "" && config.ID.User != uuid.Nil {
		opts.UserID = config.ID.User.String()
	}
	if opts.ProjectID == "" && config.ID.Project != uuid.Nil {
		opts.ProjectID = config.ID.Project.String()
	}
	if opts.Host == "" && config.Host.Domain != "" {
		opts.Host = config.Host.Domain
	}
	if opts.Port == 0 && config.Host.Port != 0 {
		opts.Port = config.Host.Port
	}
	if len(opts.ExcludeBranches) == 0 && len(config.ExcludeBranches) > 0 {
		opts.ExcludeBranches = config.ExcludeBranches
	}
	if len(opts.ExcludeFiles) == 0 && len(config.ExcludeFiles) > 0 {
		opts.ExcludeFiles = config.ExcludeFiles
	}
}
