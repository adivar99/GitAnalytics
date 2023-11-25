# Template Repository
This Repository will be used for quick deployment of a dockerized website for development.

## Technologies:
  1. Backend:
     - Python for backend language
     - FastAPI in Python for API management
     - SQLAlchemy for DB ORM
  2. Database
     - Alembic for Database Migration
     - SQLite3 for Database
  3. Frontend
     - Angular for frontend language
  4. Proxy
     - nginx server


## Features:
  1. Backend with folder structure to help with development
  2. Backend models connected with alembic
  3. SQLite DB will be generated automatically if doesn't exist
  4. Frontend code ready for development
  5. Once built and deployed, both frontend and backend will reload during dev
  6. Default admin user is created.

## To setup
  1. Docker and Docker Compose are pre-requisites for deployment
  2. Clone repository in local system (preferably with virtual env).
  4. Run `docker-compose -f baseimgs/docker-compose.yml build` to build baseimgs
  5. Run `docker-compose build` to build app images
  6. Run `docker-compose up`
  7. Type in `localhost` in your browser to open the website.
  8. You can login with credentials admin/admin123

## TODO:
  1. Upgrade to Postgres DB with containerized Postgres server
  2. Try making the project name inheritable from .env
  3. Update Landing page and Login page
