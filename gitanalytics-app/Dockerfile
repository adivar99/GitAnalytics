# Use Node.js 24-alpine as the base image
FROM node:24-alpine

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

# Expose the port Next.js runs on (default 3000)
EXPOSE 3000

# Command to run the app in development mode
CMD ["yarn", "dev"]
