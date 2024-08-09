FROM git-analytics/frontendbuilder:latest as builder-image

WORKDIR /src/angular-app/

EXPOSE 4200
CMD [ "ng", "serve", "--host", "0.0.0.0", "--disable-host-check"]

# COPY . /src
# WORKDIR /src/angular-app
# RUN npm run build

# FROM nginx:latest

# COPY --from=builder-image /src/angular-app/dist/default-portal/ /usr/share/nginx/html

# COPY ./nginx.conf /etc/nginx/conf.d/default.conf
# COPY ./nginx_server.conf /etc/nginx/nginx.conf