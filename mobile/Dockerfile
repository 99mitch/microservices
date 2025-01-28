# Use a Node.js base image
FROM node:18-bullseye

# Set the working directory
WORKDIR /mobile

# Copy package.json and package-lock.json
COPY package.json package-lock.json ./

# Install app dependencies
RUN npm install

# Copy the rest of the application
COPY . .

# Expose the port Expo will use (default: 19000, 19001 for development, and 19002 for web)
EXPOSE 19000 19001 8081

# Set the default command to start the Expo server
CMD ["npm", "start"]
