.PHONY: build clean install test run docker-build docker-build-all

# Binary name
BINARY_NAME=gitanalytics-cli

# Build directory
BUILD_DIR=bin

# Go parameters
GOCMD=go
GOBUILD=$(GOCMD) build
GOCLEAN=$(GOCMD) clean
GOTEST=$(GOCMD) test
GOGET=$(GOCMD) get
GOMOD=$(GOCMD) mod

# Docker parameters
DOCKER=docker
DOCKER_IMAGE=gitanalytics-cli-builder

# Build the binary
build:
	@echo "Building $(BINARY_NAME)..."
	@mkdir -p $(BUILD_DIR)
	$(GOBUILD) -o $(BUILD_DIR)/$(BINARY_NAME) -v

# Build for multiple platforms
build-all: build-linux build-darwin build-windows

build-linux:
	@echo "Building for Linux..."
	@mkdir -p $(BUILD_DIR)
	GOOS=linux GOARCH=amd64 $(GOBUILD) -o $(BUILD_DIR)/$(BINARY_NAME)-linux-amd64 -v

build-darwin:
	@echo "Building for macOS..."
	@mkdir -p $(BUILD_DIR)
	GOOS=darwin GOARCH=amd64 $(GOBUILD) -o $(BUILD_DIR)/$(BINARY_NAME)-darwin-amd64 -v
	GOOS=darwin GOARCH=arm64 $(GOBUILD) -o $(BUILD_DIR)/$(BINARY_NAME)-darwin-arm64 -v

build-windows:
	@echo "Building for Windows..."
	@mkdir -p $(BUILD_DIR)
	GOOS=windows GOARCH=amd64 $(GOBUILD) -o $(BUILD_DIR)/$(BINARY_NAME)-windows-amd64.exe -v

# Clean build artifacts
clean:
	@echo "Cleaning..."
	$(GOCLEAN)
	rm -rf $(BUILD_DIR)

# Install dependencies
deps:
	@echo "Installing dependencies..."
	$(GOMOD) download
	$(GOMOD) tidy

# Run tests
test:
	@echo "Running tests..."
	$(GOTEST) -v ./...

# Install the binary to $GOPATH/bin
install: build
	@echo "Installing $(BINARY_NAME)..."
	cp $(BUILD_DIR)/$(BINARY_NAME) $(GOPATH)/bin/

# Run the CLI (example usage)
run:
	$(GOBUILD) -o $(BUILD_DIR)/$(BINARY_NAME) -v
	./$(BUILD_DIR)/$(BINARY_NAME) --help

# Development run with example parameters
dev-run:
	$(GOBUILD) -o $(BUILD_DIR)/$(BINARY_NAME) -v
	./$(BUILD_DIR)/$(BINARY_NAME) -r . --user-id test-user --company-id test-company --host http://localhost --port 8080

# Docker-based builds (no Go installation required)
docker-build:
	@echo "Building with Docker (Linux AMD64)..."
	@chmod +x build-docker.sh
	@./build-docker.sh

docker-build-all:
	@echo "Building for all platforms with Docker..."
	@chmod +x build-docker-multiplatform.sh
	@./build-docker-multiplatform.sh

# Quick Docker build without script
docker-build-quick:
	@echo "Quick Docker build..."
	@mkdir -p $(BUILD_DIR)
	$(DOCKER) build --target builder -t $(DOCKER_IMAGE) .
	@CONTAINER_ID=$$($(DOCKER) create $(DOCKER_IMAGE)) && \
		$(DOCKER) cp $$CONTAINER_ID:/build/$(BINARY_NAME) $(BUILD_DIR)/$(BINARY_NAME) && \
		$(DOCKER) rm $$CONTAINER_ID > /dev/null
	@chmod +x $(BUILD_DIR)/$(BINARY_NAME)
	@echo "Binary built: $(BUILD_DIR)/$(BINARY_NAME)"

