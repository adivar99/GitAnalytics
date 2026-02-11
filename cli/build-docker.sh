#!/bin/bash

# GitAnalytics CLI Docker Build Script
# This script builds the CLI using Docker and extracts the binary

set -e  # Exit on error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
IMAGE_NAME="gitanalytics-cli-builder"
BINARY_NAME="gitanalytics-cli"
BUILD_DIR="bin"

echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}GitAnalytics CLI Docker Build${NC}"
echo -e "${BLUE}========================================${NC}"
echo ""

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    echo -e "${RED}Error: Docker is not installed or not in PATH${NC}"
    echo "Please install Docker from https://www.docker.com/get-started"
    exit 1
fi

echo -e "${GREEN}✓ Docker is installed${NC}"
echo ""

# Create build directory
echo -e "${YELLOW}Creating build directory...${NC}"
mkdir -p "$BUILD_DIR"

# Build the Docker image
echo -e "${YELLOW}Building Docker image...${NC}"
docker build --target builder -t "$IMAGE_NAME" .

if [ $? -ne 0 ]; then
    echo -e "${RED}✗ Docker build failed${NC}"
    exit 1
fi

echo -e "${GREEN}✓ Docker image built successfully${NC}"
echo ""

# Create a temporary container to extract the binary
echo -e "${YELLOW}Extracting binary from Docker image...${NC}"
CONTAINER_ID=$(docker create "$IMAGE_NAME")

# Copy the binary from the container
docker cp "$CONTAINER_ID:/build/$BINARY_NAME" "$BUILD_DIR/$BINARY_NAME"

# Clean up the temporary container
docker rm "$CONTAINER_ID" > /dev/null

if [ $? -ne 0 ]; then
    echo -e "${RED}✗ Failed to extract binary${NC}"
    exit 1
fi

echo -e "${GREEN}✓ Binary extracted successfully${NC}"
echo ""

# Make the binary executable
chmod +x "$BUILD_DIR/$BINARY_NAME"

# Get binary info
BINARY_SIZE=$(du -h "$BUILD_DIR/$BINARY_NAME" | cut -f1)
BINARY_PATH=$(pwd)/$BUILD_DIR/$BINARY_NAME

echo -e "${BLUE}========================================${NC}"
echo -e "${GREEN}Build Complete!${NC}"
echo -e "${BLUE}========================================${NC}"
echo -e "Binary location: ${GREEN}$BINARY_PATH${NC}"
echo -e "Binary size: ${GREEN}$BINARY_SIZE${NC}"

echo -e "${GREEN}Done!${NC}"

