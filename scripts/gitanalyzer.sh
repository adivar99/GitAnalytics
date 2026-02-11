#!/usr/bin/env bash

# Wrapper for all the calls to build and deploy docker.
#
# HISTORY
# Initial - Ramanuj Pandey [rpandey@fortinet.com]

version=0.2
cur_dir=$(pwd)
container_dir=$cur_dir/container
project=GitAnalytics

# Local build are auto numbered.
rel_mjr=$(date +"%y")
rel_mnr=$((($(date +%-m) - 1) / 3 + 1)) # Get current quarter, not using %q as some systems has old util-linux pkg
rel_pch=0
rel_type="Interim"

bld_num=2
rel_ver="v${rel_mjr}.${rel_mnr}.${rel_pch}-devbuild${bld_num}"

# source $cur_dir/.env

build_cli() {
    echo "Building CLI"
    cd $cur_dir/cli && make docker-build
    cd - > /dev/null
    mv $cur_dir/cli/bin/gitanalytics-cli $cur_dir/gitanalytics-app/public
}

function service_build() {
    bld_ver=$(whoami):${rel_ver}:${rel_type}:$(date +'%d%m%y-%H%M'):$(git rev-parse --abbrev-ref HEAD):$(git rev-parse --short HEAD)
    case "$2" in
    "baseimgs")
        echo "Building base images only."
        export VERSION=$bld_ver && cd $cur_dir/baseimgs/ && docker-compose build
        ;;
    "backend")
        echo "Building backend image only"
        docker-compose -f $cur_dir/docker-compose.yml build backend
        ;;
    "frontend")
        echo "Building frontend image only, after this you need to do build to make it part of container."
        docker-compose -f $cur_dir/docker-compose.yml build frontend
        ;;
    "dev")
        echo "Building dev image, Start dev service only."
        bld_ver=$(whoami):${rel_ver}:devel:$(date +'%d%m%y-%H%M'):$(git rev-parse --abbrev-ref HEAD):$(git rev-parse --short HEAD)
        echo "$bld_ver" >$cur_dir/backend/app/app/buildinfo
        build_cli
        docker-compose build
        # Removing this file in dev env will delete it from running container too.
        #rm $cur_dir/backend/app/app/buildinfo
        ;;
    "prod")
        echo "Building prod image, Start prod image only."
        echo "$bld_ver" >$cur_dir/backend/app/app/buildinfo
        build_cli
        NODE_ENV=production docker-compose build
        # TAG=${rel_ver} FRONTEND_ENV=production bash ./scripts/build.sh
        # # Update stack file also.
        # DOMAIN=$DOMAIN TRAEFIK_TAG=$TRAEFIK_TAG STACK_NAME=$STACK_NAME TAG=${rel_ver} bash scripts/deploy.sh "config"
        # rm $cur_dir/backend/app/app/buildinfo
        ;;
    *)
        echo "Supplied build option ($2) not present."
        ;;
    esac
}

function service_help() {
    echo "-----------------------------------------------------"
    echo "$0 build   - Builds baseimages, frontend and backend, generates final image."
    echo "      $0 build backend      - Builds backend image."
    echo "      $0 build frontend      - Builds frontend image."
    echo "      $0 build dev      - Builds dev images."
    echo "      $0 build prod     - Builds prod images. [TODO]"
    echo "      $0 build baseimgs - Builds baseimages only."
    echo "$0 release - Builds all images and generates release tar. [TODO]"
    echo "$0 run - Takes argument and runs as per subcommand below"
    echo "$0 start   - Starts prebuilt image."
    echo "      $0 start dev  - Starts dev image instance (yarn dev)."
    echo "      $0 start prod - Starts production image instance (yarn start)."
    echo "$0 restart - Restarts running services."
    echo "      $0 restart dev  - Restarts in development mode."
    echo "      $0 restart prod - Restarts in production mode."
    echo "$0 stop    - Stops running $project."
    echo "$0 status  - Current status of $project. [TODO]"
    echo "$0 logs [Service]    - Shows logs of given service or of all services by default."
    echo "$0 shell <Service> <sub-service>  - Gives access to shell of given service."
    echo "$0 setup   - Should run this for first time and when version of this file is changed). [TODO]"
    echo "-----------------------------------------------------"
}

if [ $# == 0 ]; then
    service_help
    exit
fi

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

BACKEND_DIR="$cur_dir/graphql"

backend_start() {
    deployment=$1
    echo -e "${GREEN}Starting backend services in ${deployment} mode...${NC}"

    # Set NODE_ENV based on deployment type
    if [ "$deployment" = "production" ]; then
        export NODE_ENV=production
    else
        export NODE_ENV=development
    fi

    # Navigate to backend graphql directory and start containers
    cd "$BACKEND_DIR" || exit 1

    echo -e "${YELLOW}Starting Docker containers with NODE_ENV=${NODE_ENV}...${NC}"
    docker compose up -d
    
    if [ $? -ne 0 ]; then
        echo -e "${RED}Failed to start Docker containers${NC}"
        cd - > /dev/null
        exit 1
    fi
    
    # Wait for PostgreSQL to be ready
    echo -e "${YELLOW}Waiting for PostgreSQL to be ready...${NC}"
    until docker compose exec -T postgres pg_isready -U postgres > /dev/null 2>&1; do
        echo "PostgreSQL is not ready yet, waiting..."
        sleep 2
    done
    echo -e "${GREEN}PostgreSQL is ready!${NC}"
    
    # Wait a bit more for PostgreSQL to fully initialize
    sleep 3
    
    # Check if pg_db database exists, create it if it doesn't
    echo -e "${YELLOW}Checking if pg_db database exists...${NC}"
    DB_EXISTS=$(docker compose exec -T postgres psql -U postgres -tAc "SELECT 1 FROM pg_database WHERE datname='pg_db'" 2>/dev/null || echo "")
    if [ -z "$DB_EXISTS" ] || [ "$DB_EXISTS" != "1" ]; then
        echo -e "${YELLOW}Database pg_db does not exist. Creating it...${NC}"
        docker compose exec -T postgres psql -U postgres -c "CREATE DATABASE pg_db;" 2>/dev/null
        if [ $? -eq 0 ]; then
            echo -e "${GREEN}✓ Database pg_db created successfully!${NC}"
        else
            echo -e "${RED}✗ Failed to create database pg_db${NC}"
            echo -e "${YELLOW}Note: This might be because the database already exists or there's a connection issue.${NC}"
        fi
    else
        echo -e "${GREEN}✓ Database pg_db already exists${NC}"
    fi
    
    echo -e "${YELLOW}Waiting for Hasura to be ready...${NC}"
    until curl -f http://localhost:8080/healthz > /dev/null 2>&1; do
        echo "Hasura is not ready yet, waiting..."
        sleep 2
    done
    
    echo -e "${GREEN}Hasura is ready!${NC}"
    
    echo -e "${YELLOW}Waiting for MinIO to be ready...${NC}"
    until curl -f http://localhost:9000/minio/health/live > /dev/null 2>&1; do
        echo "MinIO is not ready yet, waiting..."
        sleep 2
    done
    
    echo -e "${GREEN}MinIO is ready!${NC}"
    
    # Check if hasura CLI is available
    if command -v hasura &> /dev/null; then
        echo -e "${YELLOW}Step 1: Applying metadata (to register database connection)...${NC}"
        hasura metadata apply --endpoint http://localhost:8080 --admin-secret myadminsecretkey
        
        # Note: metadata apply might show warnings about missing tables, which is expected
        echo -e "${GREEN}✓ Metadata applied (database registered)${NC}"
        
        # echo -e "${YELLOW}Step 2: Applying migrations (to create tables)...${NC}"
        # hasura migrate apply --from-server --endpoint http://localhost:8080 --admin-secret myadminsecretkey --database-name postgresDB
        
        if [ $? -eq 0 ]; then
            echo -e "${GREEN}✓ Migrations applied successfully!${NC}"
        else
            echo -e "${RED}✗ Failed to apply migrations${NC}"
            cd - > /dev/null
            exit 1
        fi
        
        echo -e "${YELLOW}Step 3: Reloading metadata (to track tables)...${NC}"
        hasura metadata reload --endpoint http://localhost:8080 --admin-secret myadminsecretkey
        
        if [ $? -eq 0 ]; then
            echo -e "${GREEN}✓ Metadata reloaded successfully!${NC}"
        else
            echo -e "${YELLOW}Note: Metadata reload had issues, but tables should be created${NC}"
        fi
    else
        echo -e "${RED}Hasura CLI not found. Please install it first:${NC}"
        echo "curl -L https://github.com/hasura/graphql-engine/raw/stable/cli/get.sh | bash"
        cd - > /dev/null
        exit 1
    fi
    
    cd - > /dev/null
    
    echo ""
    echo -e "${GREEN}========================================${NC}"
    echo -e "${GREEN}Backend started successfully!${NC}"
    echo -e "${GREEN}========================================${NC}"
    echo -e "Hasura Console: ${YELLOW}http://localhost:8080/console${NC}"
    echo -e "GraphQL Endpoint: ${YELLOW}http://localhost:8080/v1/graphql${NC}"
    echo -e "MinIO API: ${YELLOW}http://localhost:9000${NC}"
    echo -e "MinIO Console: ${YELLOW}http://localhost:9001${NC}"
    echo -e "MinIO Credentials: ${YELLOW}minioadmin / minioadmin123${NC}"
    echo ""
}

backend_stop() {
    echo -e "${YELLOW}Stopping backend services...${NC}"
    
    cd "$BACKEND_DIR" || exit 1
    
    # Check if Hasura is running before exporting metadata
    if curl -f http://localhost:8080/healthz > /dev/null 2>&1; then
        echo -e "${YELLOW}Exporting metadata...${NC}"
        
        if command -v hasura &> /dev/null; then
            hasura metadata export --endpoint http://localhost:8080
            
            if [ $? -eq 0 ]; then
                echo -e "${GREEN}✓ Metadata exported successfully!${NC}"
            else
                echo -e "${RED}✗ Failed to export metadata${NC}"
            fi
        else
            echo -e "${RED}Hasura CLI not found. Skipping metadata export.${NC}"
        fi
    else
        echo -e "${YELLOW}Hasura is not running. Skipping metadata export.${NC}"
    fi
    
    echo -e "${YELLOW}Stopping Docker containers...${NC}"
    docker compose down --remove-orphans
    
    if [ $? -eq 0 ]; then
        echo -e "${GREEN}✓ Containers stopped successfully!${NC}"
    else
        echo -e "${RED}✗ Failed to stop containers${NC}"
    fi
    
    cd - > /dev/null
    
    echo ""
    echo -e "${GREEN}Backend stopped successfully!${NC}"
    echo ""
}

backend_restart() {
    deployment=$1
    echo -e "${YELLOW}Restarting backend services...${NC}"
    backend_stop
    sleep 2
    backend_start "$deployment"
}

backend_status() {
    echo -e "${YELLOW}Checking backend status...${NC}"
    echo ""
    
    cd "$BACKEND_DIR" || exit 1
    docker compose ps
    cd - > /dev/null
    
    echo ""
    if curl -f http://localhost:8080/healthz > /dev/null 2>&1; then
        echo -e "${GREEN}✓ Hasura is running${NC}"
        echo -e "  Console: ${YELLOW}http://localhost:8080/console${NC}"
    else
        echo -e "${RED}✗ Hasura is not accessible${NC}"
    fi
    
    if curl -f http://localhost:9000/minio/health/live > /dev/null 2>&1; then
        echo -e "${GREEN}✓ MinIO is running${NC}"
        echo -e "  API: ${YELLOW}http://localhost:9000${NC}"
        echo -e "  Console: ${YELLOW}http://localhost:9001${NC}"
    else
        echo -e "${RED}✗ MinIO is not accessible${NC}"
    fi
    echo ""
}

backend_console() {
    echo -e "${GREEN}Opening Hasura Console with migration tracking...${NC}"
    echo ""
    echo -e "${YELLOW}Important: Use this console to make schema changes!${NC}"
    echo -e "${YELLOW}This will automatically create migration files.${NC}"
    echo ""
    
    # Check if Hasura is running
    if ! curl -f http://localhost:8080/healthz > /dev/null 2>&1; then
        echo -e "${RED}✗ Hasura is not running. Please run './backend.sh start' first.${NC}"
        exit 1
    fi
    
    # Check if hasura CLI is available
    if ! command -v hasura &> /dev/null; then
        echo -e "${RED}Hasura CLI not found. Please install it first:${NC}"
        echo "curl -L https://github.com/hasura/graphql-engine/raw/stable/cli/get.sh | bash"
        exit 1
    fi
    
    cd "$BACKEND_DIR" || exit 1
    
    echo -e "${GREEN}Starting Hasura Console...${NC}"
    echo -e "${YELLOW}The console will open in your browser at http://localhost:9695${NC}"
    echo -e "${YELLOW}Press Ctrl+C to stop the console${NC}"
    echo ""
    
    # Start the console with CLI - this will track all changes and create migrations
    hasura console --endpoint http://localhost:8080 --admin-secret myadminsecretkey
    
    cd - > /dev/null
}

backend_reset() {
    deployment=$1
    echo -e "${YELLOW}⚠️  WARNING: This will remove all containers and volumes!${NC}"
    echo -e "${YELLOW}All data will be lost. This is useful for a fresh start.${NC}"
    read -p "Are you sure you want to continue? (yes/no): " confirm
    if [ "$confirm" != "yes" ]; then
        echo -e "${YELLOW}Reset cancelled.${NC}"
        return
    fi

    echo -e "${YELLOW}Stopping and removing containers and volumes...${NC}"
    cd "$BACKEND_DIR" || exit 1
    docker compose down -v
    cd - > /dev/null

    echo -e "${GREEN}✓ Containers and volumes removed${NC}"
    echo -e "${YELLOW}Starting fresh...${NC}"
    backend_start "$deployment"
}

case $1 in
"build")
    service_build $*
    if [ "$?" != "0" ]; then
        echo "Build error, check logs above"
        exit 2
    fi
    ;;
"start")
    case $2 in
    "dev")
        echo "Starting project in dev mode with reloads"
        backend_start "development"
        ;;
    "build")
        service_build dev
        echo "Starting project in dev mode with reloads"
        backend_start "development"
        ;;
    "prod")
        echo "Starting project in prod mode without reload and scalable"
        backend_start "production"
        ;;
    *)
        echo "Please specify 'dev' or 'prod'"
        echo "Usage: $0 start [dev|prod]"
        exit 1
        ;;
    esac
    ;;
"restart")
    case $2 in
    "dev")
        backend_restart "development"
        ;;
    "prod")
        backend_restart "production"
        ;;
    *)
        echo "Please specify 'dev' or 'prod'"
        echo "Usage: $0 restart [dev|prod]"
        exit 1
        ;;
    esac
    ;;
"logs")
    if [ $# == 1 ]; then
        docker-compose logs -f
    else
        docker-compose logs $2 -f
    fi
    ;;
"shell")
    if [ $# == 1 ]; then
        echo "Please provide a Service and a command to run"
        exit 1
    fi
    docker-compose exec -it $1 $2
    ;;
"stop")
    echo "Stopping running containers"
    backend_stop
esac

