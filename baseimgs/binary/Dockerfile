# Stage 1:
# Use base Alpine image to prepare our binary, label it 'app'
FROM golang:alpine as app
# Add golangdocker user and group so that the Docker process in Scratch doesn't run as root
RUN addgroup -S golangdocker \
 && adduser -S -u 10000 -g golangdocker golangdocker
# Copy all the files from the base of our repository to the current directory we will use
COPY . /go/src/app/
# Go to the directory
WORKDIR /go/src/app/adithya.com/commitment/

RUN ls -lahtr
# Compile the application to a single statically-linked binary file
RUN CGO_ENABLED=0 go install -ldflags '-extldflags "-static"' -tags timetzdata