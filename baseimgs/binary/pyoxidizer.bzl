
# Replace "your_project" with the name of your project
app_name = "your_project"

def pyoxidizer_hook(rule):
    if rule.attr == "package":
        # Add any additional files you need to include in the binary here
        extra_files = []

        rule.sub_rule.add_deps(extra_files)

        rule.sub_rule.sub_sub_rule.sub_sub_sub_rule.sub_sub_sub_sub_rule.sub_sub_sub_sub_sub_rule.add_include(os.path.join(rule.attr, app_name))

# Add your Python files here
app_files = [
    "package/main.py",
]

build_package = {
    "name": "app",
    "python_version": "3.11",
    "packages": [
        {"include": app_name},
    ],
    "files": app_files,
    "includes": ["bin"],
    "excludes": ["__pycache__", "*.pyc", "*.pyo"],
    "extensions": ["rs3"],
    "callbacks": [
        pyoxidizer_hook,
    ],
}