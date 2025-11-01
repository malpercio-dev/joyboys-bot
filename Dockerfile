# Build stage
FROM node:22-alpine AS builder

# install openssl
RUN apk update && apk upgrade
RUN apk add --no-cache openssl

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install all dependencies (including dev dependencies for building)
RUN npm ci

# Copy source code and configuration
COPY tsconfig.json ./
COPY prisma ./prisma
COPY src ./src

# Build TypeScript project
RUN npm run build

# Generate Prisma client
RUN npm run db:generate

# Production stage
FROM node:22-alpine

# install openssl
RUN apk update && apk upgrade
RUN apk add --no-cache openssl

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install only production dependencies
RUN npm ci --only=production

# Copy built application from builder stage
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/prisma ./prisma

# Generate Prisma client with production dependencies
RUN npx prisma generate

# Create data directory for SQLite database
RUN mkdir -p data

# Set environment to production
ENV NODE_ENV=production

# Run database migrations on startup, then start the bot
CMD ["sh", "-c", "npx prisma migrate deploy && node dist/index.js"]

