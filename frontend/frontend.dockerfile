FROM git-analytics/frontendbuilder:latest as builder-image

WORKDIR /src/angular-app/

EXPOSE 4200
CMD [ "ng", "serve", "--host", "0.0.0.0", "--disable-host-check"]
