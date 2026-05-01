# ---- Stage 1: Build ----
FROM node:24-slim AS build

RUN apt-get update -y && apt-get install -y openssl && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Build the React client
COPY client/package.json client/package-lock.json ./client/
RUN cd client && npm install

COPY client/ ./client/
RUN cd client && VITE_API_URL="" npm run build

# Install server dependencies and generate Prisma client
COPY server/package.json server/package-lock.json ./server/
RUN cd server && npm install

COPY server/ ./server/
RUN cd server && npx prisma generate

# ---- Stage 2: Runtime ----
FROM node:24-slim

RUN apt-get update -y && apt-get install -y openssl && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Copy server with its node_modules (includes generated Prisma client)
COPY --from=build /app/server ./server

# Copy the built React frontend
COPY --from=build /app/client/dist ./client/dist

# Create the directory where the Docker volume will mount
RUN mkdir -p /app/server/prisma/data

EXPOSE 3000

WORKDIR /app/server
CMD ["sh", "-c", "npx prisma migrate deploy && node index.js"]
