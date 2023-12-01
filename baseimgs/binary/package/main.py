import re
import git
import sys
import json
import yaml
from datetime import datetime, timedelta


##################################################

excluded_branches = ['cherry-pick-*', "^(?!.*origin/).*$"]

class GitAgent:
    def __init__(self):
        self.main()

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
        for reg in excluded_branches:
            return re.match(branch, reg)



    def main(self):
        try:
            repo = git.Repo()
            
            config = None
            with open('.gitanalytics', "r") as config_file:
                config = yaml.safe_load(config_file)

            # Get the master branch
            master_branch = repo.heads.master

            # Switch to the master branch
            repo.head.reference = master_branch

            # Get all commits in the last three months
            last_three_months = datetime.now() - timedelta(days=90)
            commits = list(repo.iter_commits('master', since=last_three_months))

            print(f"Found {len(commits)}")
            master_details = []
            for commit in commits:
                master_details.append(self.get_commit_details(commit))


            with open('master_details.json', 'w') as outfile:
                json.dump(master_details, outfile, indent=4)

            # Iterate through the other branches and store the info
            branches = []
            for branch in repo.refs:
                branch_details = {}
                if branch != master_branch:
                    if self.excluded_branch(branch):
                        continue  #config.exclude_branches:
                    branch_details["name"] = branch.name
                    branch_details["last_commits"] = []

                    commits = list(repo.iter_commits('branch', max_count=10, since=last_three_months))
                    for commit in commits:
                        branch_details["last_commits"].append(self.get_commit_details(commit))
                branches.append(branch_details)
            
            with open('branch_details.json', 'w') as outfile:
                json.dump(branch_details, outfile, indent=4)

        except Exception as e:
            print("Error occurred while executing the command:", file=sys.stderr)
            print(str(e), file=sys.stderr)
            sys.exit(1)

GitAgent()