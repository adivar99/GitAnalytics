package main

import (
	"context"
	"log"
	"net/http"
	"os"
	"os/signal"
	"syscall"
	"time"

	"gitanalytics/server/graph"
	"gitanalytics/server/graph/generated"
	"gitanalytics/server/handlers"
	"gitanalytics/server/pkg/hasura"

	"github.com/99designs/gqlgen/graphql/handler"
	"github.com/99designs/gqlgen/graphql/playground"
	"github.com/joho/godotenv"
)

func main() {
	// Load environment variables from .env file (if exists)
	_ = godotenv.Load()

	// Create HTTP router
	mux := http.NewServeMux()

	// Initialize Hasura Client
	hasuraClient := hasura.NewClient()

	// Create GraphQL Server
	gqlServer := handler.NewDefaultServer(
		generated.NewExecutableSchema(
			generated.Config{
				Resolvers: &graph.Resolver{
					HasuraClient: hasuraClient,
				},
			},
		),
	)

	// Create Analytics Handler
	analyticsHandler := handlers.NewAnalyticsHandler(hasuraClient)

	// Routes
	mux.Handle("/query", gqlServer)
	mux.Handle("/", playground.Handler("GraphQL playground", "/query"))
	mux.HandleFunc("/health", func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusOK)
		w.Write([]byte(`{"status":"ok"}`))
	})
	mux.HandleFunc("/ingest", analyticsHandler.IngestAnalytics)

	// Logging middleware
	loggingHandler := func(next http.Handler) http.Handler {
		return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			if r.URL.Path == "/health" {
				// Skip logging for /ingest as it's already handled within the handler
				next.ServeHTTP(w, r)
				return
			}
			start := time.Now()

			// Log incoming request
			log.Printf("[%s] %s %s from %s", r.Method, r.URL.Path, r.Proto, r.RemoteAddr)

			next.ServeHTTP(w, r)

			// Log request completion
			duration := time.Since(start)
			log.Printf("[%s] %s completed in %v", r.Method, r.URL.Path, duration)
		})
	}

	// Simple CORS middleware wrapper since we deleted the middleware package
	corsHandler := func(next http.Handler) http.Handler {
		return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			w.Header().Set("Access-Control-Allow-Origin", "*")
			w.Header().Set("Access-Control-Allow-Methods", "POST, GET, OPTIONS, PUT, DELETE")
			w.Header().Set("Access-Control-Allow-Headers", "Accept, Content-Type, Content-Length, Accept-Encoding, X-CSRF-Token, Authorization")

			if r.Method == "OPTIONS" {
				return
			}
			next.ServeHTTP(w, r)
		})
	}(loggingHandler(mux))

	// Get port from environment or use default
	port := os.Getenv("PORT")
	if port == "" {
		port = "8081"
	}

	// Create HTTP server
	srv := &http.Server{
		Addr:         ":" + port,
		Handler:      corsHandler,
		ReadTimeout:  15 * time.Second,
		WriteTimeout: 15 * time.Second,
		IdleTimeout:  60 * time.Second,
	}

	// Start server in a goroutine
	go func() {
		log.Println("=====================================")
		log.Printf("🚀 GitAnalytics Server Starting")
		log.Printf("📍 Port: %s", port)
		log.Printf("🔗 GraphQL Playground: http://localhost:%s/", port)
		log.Printf("🔗 GraphQL Endpoint: http://localhost:%s/query", port)
		log.Printf("🔗 Ingest Endpoint: http://localhost:%s/ingest", port)
		log.Printf("🔗 Health Check: http://localhost:%s/health", port)
		log.Println("=====================================")
		log.Printf("✅ Server is ready to accept requests")

		if err := srv.ListenAndServe(); err != nil && err != http.ErrServerClosed {
			log.Fatalf("❌ Server failed to start: %v", err)
		}
	}()

	// Wait for interrupt signal to gracefully shutdown the server
	quit := make(chan os.Signal, 1)
	signal.Notify(quit, syscall.SIGINT, syscall.SIGTERM)
	<-quit

	log.Println("⚠️  Shutdown signal received, shutting down server...")

	// Graceful shutdown with timeout
	ctx, cancel := context.WithTimeout(context.Background(), 30*time.Second)
	defer cancel()

	if err := srv.Shutdown(ctx); err != nil {
		log.Fatalf("❌ Server forced to shutdown: %v", err)
	}

	log.Println("✅ Server exited gracefully")
}
