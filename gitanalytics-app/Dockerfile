# Use Node.js 24-alpine as the base image
FROM node:24-alpine

# Build argument to determine environment (development or production)
ARG NODE_ENV=development

# Upgrade apk
RUN apk -U upgrade

# Set working directory
WORKDIR /src/gitanalytics-app

# Copy package.json and package-lock.json to install dependencies
COPY package*.json ./

# Install dependencies
RUN yarn install 

# Copy the rest of the application code
COPY . .

# Build the app for production if needed
RUN echo "NODE_ENV is $NODE_ENV"
RUN if [ "$NODE_ENV" = "production" ]; then yarn build; fi

# Expose the port Next.js runs on (default 3000)
EXPOSE 3000

# Command based on environment
CMD if [ "$NODE_ENV" = "production" ]; then yarn start; else yarn dev; fi

