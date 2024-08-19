# GitAnalytics
The GitAnalytics project is intended to provide a platform for users to evaluate the versioning efficiency of their project users. The multiple features that we aim to show you in the website are:
 1. rating of the contributors in your project based on commits size and frequency, code integrity, reworkability
 2. categorization of the branches in your project i.e. 'stale', 'active' and 'dead'
 3. historical analysis of your project


### Dependencies:
 1. Docker
 2. Docker-compose

### To build
    NOTE: currently need to navigate to frontend/angular-app and run 'npm install' locally before running docker containers. Need to fix.
 1. `./gitanalyzer.sh build baseimgs`
 2. `./gitanalyzer.sh build dev`

### To Bring up Application
 1. `./gitanalyzer.sh start dev`
 2. open `localhost` in your browser
