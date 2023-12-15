import re
import os
import git
import sys
import json
import yaml
import requests

from typing import List, Dict
from datetime import datetime, timedelta


##################################################

# excluded_branches = ['origin/cherry-pick-*', "^(?!.*origin/).*$"]


class HttpAgent:
    def __init__(self, domain: str, port: int) -> None:
        self.domain = domain
        self.port = port
        self.api_prefix = "/api/v1"

        self.MASTER_INFO_API = "/agent/master_info"
        self.BRANCH_INFO_API = "/agent/branch_info"

    def __get(self, url, *, args: Dict = {}):
        arg_str = "?"
        for arg, val in args.items():
            arg_str += f"{arg}={val}&"
        
        if len(args) > 0:
            url += arg_str

        ga_url = f"{self.domain}:{self.port}{url}"
        
        resp = requests.get(ga_url)
        return resp.status_code == 200


    def __post(self, url: str, *, args: Dict = {}, data: dict = {}):
        arg_str = "?"
        for arg, val in args.items():
            arg_str += f"{arg}={val}&"
        
        if len(args) > 0:
            url += arg_str

        ga_url = f"{self.domain}:{self.port}{url}"
        
        resp = requests.post(ga_url, data)
        return resp.status_code == 200
    
    def send_master_info(self, data: dict):
        uri = f"{self.api_prefix}{self.MASTER_INFO_API}"
        resp = self.__post(uri, data=data)

    def send_branch_info(self, data: dict):
        uri = f"{self.api_prefix}{self.MASTER_INFO_API}"
        resp = self.__post(uri, data=data)

class GitAgent:
    def __init__(self, repo_dir):
        self.master_details = []
        self.branches = []
        self.timespan: timedelta = timedelta(days=90)

        self.load_config()

        self.http = HttpAgent(self.config["host"]["domain"], self.config["host"]["port"])

        try:
            repo = git.Repo(repo_dir)
        
        except Exception as e:
            print("Error occurred while Initializing Repo:", file=sys.stderr)
            print(str(e), file=sys.stderr)
            sys.exit(1)
        

        self.analyse_master(repo)

        self.analyse_branches(repo)

        self.sync_info()

    def load_config(self):
        if not os.path.exists(".gitanalytics"):
            print("Could not find config file. Please create a .gitanalytics file for configuration")
            return
        
        self.config = None
        try:
            with open('.gitanalytics', "r") as config_file:
                self.config = yaml.safe_load(config_file)
        except Exception as e:
            print("Error occurred while opening config file: ", file=sys.stderr)
            print(str(e), file=sys.stderr)
            sys.exit(1)
        
    def get_commit_details(self, commit):
        commit_data = {
            'hexsha': commit.hexsha,
            'message': commit.message,
            'author': commit.author.name,
            'email': commit.author.email,
            'date': commit.authored_datetime.strftime('%Y-%m-%d %H:%M:%S'),
            'files_changed': []
        }

        for file_change in commit.stats.files.items():
            file_data = {
                'filename': file_change[0],
                'lines_added': file_change[1]["insertions"],
                'lines_deleted': file_change[1]["deletions"],
            }
            commit_data['files_changed'].append(file_data)

        return commit_data
    
    def excluded_branch(self, branch):
        for reg in self.config["exclude_branches"]:
            if re.match(reg, branch) is not None:
                return False
        return True
    
    def analyse_master(self, repo):
        # Get the master branch
        master_branch = repo.heads.master

        # Switch to the master branch
        repo.head.reference = master_branch

        # Get all commits in the last three months
        last_three_months = datetime.now() - self.timespan
        commits = list(repo.iter_commits('master', since=last_three_months))

        print(f"Found {len(commits)} commits in master since "+str(datetime.now()-self.timespan))
        for commit in commits:
            self.master_details.append(self.get_commit_details(commit))

        # with open('master_details.json', 'w') as outfile:
        #     json.dump(self.master_details, outfile, indent=4)

    def analyse_branches(self, repo):
        # Iterate through the other branches and store the info
        for branch in repo.refs:
            branch_details = {}
            if branch != repo.heads.master:
                if self.excluded_branch(branch.name):
                    continue
                
                branch_details["name"] = branch.name
                branch_details["last_commits"] = []

                since_date = datetime.now() - self.timespan
                commits = list(repo.iter_commits(branch, max_count=10, since=since_date))
                for commit in commits:
                    branch_details["last_commits"].append(self.get_commit_details(commit))
            self.branches.append(branch_details)
        
        print(f"Found {len(self.branches)} branches")
        
        # with open('branch_details.json', 'w') as outfile:
        #     json.dump(self.branches, outfile, indent=4)
    
    def sync_master_info(self):
        data = json.dumps(self.master_details)
        self.http.send_master_info(data)

    def sync_branch_info(self):
        data = json.dumps(self.branches)
        self.http.send_master_info(data)

if __name__ == "__main__":
    GitAgent(".")