# Use the official Python image as a parent image
FROM python:3.10

# Set the working directory to /app
WORKDIR /app

# Copy the current directory contents into the container at /app
COPY . /app

# Install any needed packages specified in requirements.txt
RUN pip install --trusted-host pypi.python.org -r requirements.txt

# Run pyoxidizer to compile the python code into a binary
# RUN pyoxidizer build --release

# Copy the compiled binary to /bin in the container
# COPY bin/ /bin

# Run the compiled binary
# CMD ["/bin/app"]