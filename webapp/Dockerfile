FROM node:18.18.0-alpine

# Set the working directory
WORKDIR /webapp

# Copy package files
COPY package.json package-lock.json ./

# Install dependencies
RUN npm ci

# Copy the rest of the app
COPY . .

# Expose the port used by the app
EXPOSE 3000

# Set environment to development
ENV NODE_ENV=development

# Start the dev server
CMD ["npm", "run", "dev"]
