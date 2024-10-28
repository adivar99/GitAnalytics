# GitAnalytics
If you've ever been a part of a sufficiently large team with a codebase that has been constantly worked on for a few years, you understand the frustration of watching others in your team maintain bad code committing practices or knowing that you've had to over-write and correct your teammates code over and over again.

The GitAnalytics Project was a project created to help users summarize and analyse their versioning practices within their project. It gives you dashboard analytics on who has been committing bad code over-and-over again. Now you can find who has been blamed for the most amount of bugs in the project. And it also ranks the collaborators in your project based on the amount of commits that get approved and how many times someone has had to rewrite their code.

#### Landing Page
![image](https://github.com/user-attachments/assets/83b84ed0-68d0-4f1e-aca7-8abbf360ae74)

#### Dashboard
Manage multiple projects within your company, having access to both a generic and detailed dashboard of individual projects, or all the projects as a whole.
![image](https://github.com/user-attachments/assets/6c3f508e-552f-4637-a02a-4dd32de423a1)

## Author's Note
  This project was a brainchild of a Hackathon during my previous work experience. Even though we didn't submit it at the end of it, I kept working on it as a hobby project as I saw a potential in the idea. This project is still a work in progress and it's slow because I'm learning a lot of the technologies that I applied to this project i.e. Angular, Golang and Docker services. If you're interested in collaborating on the project, Please let me know. 

  I've made the project as modular as I can, therefore you don't need to download any dependencies to get the project running on your system. You only need docker to get the project up and running.

### Technologies Used:
  1. Backend
     a. Python
     b. FastAPI
     c. SQLAlchemy
  3. Frontend
     a. Angular
     b. Material UI
  5. Scanner
     a. Golang
  7. Infrastructure
     a. Docker
     b. Docker Compose

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
