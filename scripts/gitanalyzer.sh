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

source $cur_dir/.env

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
        docker-compose build
        # Removing this file in dev env will delete it from running container too.
        #rm $cur_dir/backend/app/app/buildinfo
        ;;
    "prod")
        echo "TODO: Building prod image, Start prod image only."
        # echo "$bld_ver" >$cur_dir/backend/app/app/buildinfo
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
    echo "$0 release - Builds all images and generates release tar."
    echo "$0 onprem_release - Builds all images and generates onprem release tar."
    echo "$0 run - Takes argument and runs as per subcommand below"
    echo "$0 start   - Starts prebuilt image."
    echo "      $0 start dev  - Starts dev image instance."
    echo "      $0 start prod - Starts production image instance. [TODO]"
    echo "$0 stop    - Stops running $project."
    echo "$0 status  - Current status of $project."
    echo "$0 logs [Service]    - Shows logs of given service or of all services by default."
    echo "$0 shell <Service> <sub-service>  - Gives access to shell of given service."
    echo "$0 archive   - Archives current HEAD to an archive. [TODO]"
    echo "$0 setup   - Should run this for first time and when version of this file is changed). [TODO]"
    echo "-----------------------------------------------------"
}

if [ $# == 0 ]; then
    service_help
    exit
fi

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
        docker-compose up -d
        ;;
    "prod")
        echo "TODO: Start the project in prod mode without reload and scalable"
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
    docker-compose exec -it --rm $1 $2
    ;;
"stop")
    echo "Stopping running containers"
    docker-compose down --remove-orphans
esac

