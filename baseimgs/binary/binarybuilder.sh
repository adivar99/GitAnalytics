#!/bin/sh
pip install -r requirements.txt

pyinstaller -F --clean --name gitBinary -d all --log-level=DEBUG package/main.py > build.txt