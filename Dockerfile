# Use an official Node.js runtime as a parent image
FROM node:20-alpine

WORKDIR /app

COPY package*.json ./

COPY . .

RUN npm install && \
    npm run build

# Expose a port (adjust if your app uses a different one)
EXPOSE 5173

# Default command for development (adjust as necessary)
CMD [ "npm", "run", "dev" ]
