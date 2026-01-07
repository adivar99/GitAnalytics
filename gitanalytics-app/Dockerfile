FROM node:24-alpine

RUN apk -U upgrade

WORKDIR /src/gitanalytics-app

COPY package.json .
# COPY package-lock.json .

RUN npm install

COPY . .

RUN npm run build

EXPOSE 3000

CMD ["npm", "start"]
