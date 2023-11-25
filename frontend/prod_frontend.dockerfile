FROM template/frontendbuilder:latest as builder-image
COPY . /src
WORKDIR /src/angular-app
RUN npm run build
RUN ls -lahtr /src/angular-app/dist/ & sleep 15

FROM nginx:latest
COPY --from=builder-image /src/angular-app/dist/angular-app/ /usr/share/nginx/html

COPY ./nginx.conf /etc/nginx/conf.d/default.conf
COPY ./nginx_server.conf /etc/nginx/nginx.conf
