# ai-fastapi-app/frontend/Dockerfile

# Multi-stage Dockerfile for React app
# Supports both development and production builds

# Base stage for shared dependencies
FROM node:18-alpine AS base
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci --only=production && npm cache clean --force

# Development stage
FROM base AS development
RUN npm ci
COPY . .
EXPOSE 3000
ENV NODE_ENV=development
CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0"]

# Build stage for production
FROM base AS build
RUN npm ci
COPY . .
RUN npm run build

# Production stage
FROM nginx:stable-alpine AS production
# Copy custom nginx config if needed
# COPY nginx.conf /etc/nginx/nginx.conf

# Copy built app from build stage
COPY --from=build /app/dist /usr/share/nginx/html

# Add health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:80/ || exit 1

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]

# Default to production build
FROM production