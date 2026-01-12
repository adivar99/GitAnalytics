# Multi-stage build for GitAnalytics CLI
# Stage 1: Build the Go binary
FROM golang:1.21-alpine AS builder

# Install build dependencies
RUN apk add --no-cache git make

# Set working directory
WORKDIR /build

# Copy go mod files first for better caching
COPY go.mod go.sum ./
RUN go mod download

# Copy source code
COPY . .

# Build the binary
# CGO_ENABLED=0 for static binary (no C dependencies)
# -ldflags="-w -s" to reduce binary size (strip debug info)
RUN CGO_ENABLED=0 GOOS=linux GOARCH=amd64 go build \
    -ldflags="-w -s" \
    -o gitanalytics-cli \
    .

# Stage 2: Create a minimal runtime image (optional, for running in container)
FROM alpine:latest AS runtime

RUN apk add --no-cache ca-certificates git

WORKDIR /app

COPY --from=builder /build/gitanalytics-cli .

ENTRYPOINT ["/app/gitanalytics-cli"]

# Stage 3: Export stage - just the binary
FROM scratch AS export
COPY --from=builder /build/gitanalytics-cli /

