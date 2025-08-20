# Dockerfile for Gymmy's Phase 4 Backend - ML-powered improvement detection
# Multi-stage build for production deployment

# ==============================================================================
# BUILD STAGE
# ==============================================================================
FROM node:18-alpine AS builder

# Set working directory
WORKDIR /app

# Install build dependencies
RUN apk add --no-cache python3 make g++

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci --only=production && npm cache clean --force

# Copy source code
COPY . .

# Build TypeScript
RUN npm run build

# ==============================================================================
# PRODUCTION STAGE
# ==============================================================================
FROM node:18-alpine AS production

# Create non-root user for security
RUN addgroup -g 1001 -S nodejs && \
    adduser -S gymmy -u 1001

# Set working directory
WORKDIR /app

# Install production dependencies only
COPY package*.json ./
RUN npm ci --only=production && npm cache clean --force

# Copy built application from builder stage
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules

# Create necessary directories
RUN mkdir -p logs models && \
    chown -R gymmy:nodejs /app

# Switch to non-root user
USER gymmy

# Expose port
EXPOSE 3001

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node dist/health-check.js || exit 1

# Set environment variables
ENV NODE_ENV=production
ENV PORT=3001

# Start the application
CMD ["node", "dist/index.js"]

# ==============================================================================
# DEVELOPMENT STAGE (optional)
# ==============================================================================
FROM node:18-alpine AS development

# Set working directory
WORKDIR /app

# Install all dependencies including dev dependencies
COPY package*.json ./
RUN npm install

# Copy source code
COPY . .

# Expose port
EXPOSE 3001

# Set environment variables
ENV NODE_ENV=development
ENV PORT=3001

# Start development server
CMD ["npm", "run", "dev"]

# ==============================================================================
# TESTING STAGE (optional)
# ==============================================================================
FROM node:18-alpine AS testing

# Set working directory
WORKDIR /app

# Install all dependencies
COPY package*.json ./
RUN npm install

# Copy source code
COPY . .

# Run tests
CMD ["npm", "test"]
