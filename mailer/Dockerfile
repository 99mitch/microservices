# Mailer Dockerfile
FROM node:18-alpine

# Set the working directory
WORKDIR /mailer

# Copy package files
COPY package.json package-lock.json ./

# Install dependencies
RUN npm install

# Copy the source code
COPY . .

# Expose the port used by the service
EXPOSE 3002

# Start the service
CMD ["node", "server.js"]
