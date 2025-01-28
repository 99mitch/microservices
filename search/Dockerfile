# Use the official Node.js image
FROM node:18-alpine

# Set the working directory
WORKDIR /search

# Copy package.json and package-lock.json
COPY package*.json ./

# Install dependencies
RUN npm install --no-cache

# Copy the application code
COPY . .

# Expose the port the app runs on
EXPOSE 3001

# Command to run the app
CMD ["node", "server.js"]
