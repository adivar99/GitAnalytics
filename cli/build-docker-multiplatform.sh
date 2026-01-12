#!/bin/bash

# GitAnalytics CLI Multi-Platform Docker Build Script
# Builds binaries for Linux, macOS (Intel & ARM), and Windows

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
echo -e "${BLUE}GitAnalytics CLI Multi-Platform Build${NC}"
echo -e "${BLUE}========================================${NC}"
echo ""

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    echo -e "${RED}Error: Docker is not installed or not in PATH${NC}"
    exit 1
fi

echo -e "${GREEN}✓ Docker is installed${NC}"
echo ""

# Create build directory
mkdir -p "$BUILD_DIR"

# Function to build for a specific platform
build_platform() {
    local GOOS=$1
    local GOARCH=$2
    local OUTPUT_NAME=$3
    
    echo -e "${YELLOW}Building for $GOOS/$GOARCH...${NC}"
    
    # Build with platform-specific environment variables
    docker build \
        --build-arg GOOS="$GOOS" \
        --build-arg GOARCH="$GOARCH" \
        --target builder \
        -t "$IMAGE_NAME-$GOOS-$GOARCH" \
        -f Dockerfile.multiplatform \
        .
    
    # Extract binary
    CONTAINER_ID=$(docker create "$IMAGE_NAME-$GOOS-$GOARCH")
    docker cp "$CONTAINER_ID:/build/$BINARY_NAME" "$BUILD_DIR/$OUTPUT_NAME"
    docker rm "$CONTAINER_ID" > /dev/null
    
    # Make executable (except Windows)
    if [ "$GOOS" != "windows" ]; then
        chmod +x "$BUILD_DIR/$OUTPUT_NAME"
    fi
    
    # Get size
    SIZE=$(du -h "$BUILD_DIR/$OUTPUT_NAME" | cut -f1)
    echo -e "${GREEN}✓ Built $OUTPUT_NAME ($SIZE)${NC}"
    
    # Clean up image
    docker rmi "$IMAGE_NAME-$GOOS-$GOARCH" > /dev/null 2>&1 || true
}

# Build for all platforms
echo -e "${BLUE}Building binaries for all platforms...${NC}"
echo ""

build_platform "linux" "amd64" "$BINARY_NAME-linux-amd64"
build_platform "linux" "arm64" "$BINARY_NAME-linux-arm64"
build_platform "darwin" "amd64" "$BINARY_NAME-darwin-amd64"
build_platform "darwin" "arm64" "$BINARY_NAME-darwin-arm64"
build_platform "windows" "amd64" "$BINARY_NAME-windows-amd64.exe"

echo ""
echo -e "${BLUE}========================================${NC}"
echo -e "${GREEN}Multi-Platform Build Complete!${NC}"
echo -e "${BLUE}========================================${NC}"
echo ""
echo -e "Built binaries in ${GREEN}$BUILD_DIR/${NC}:"
ls -lh "$BUILD_DIR" | grep "$BINARY_NAME"
echo ""
echo -e "${GREEN}Done!${NC}"

