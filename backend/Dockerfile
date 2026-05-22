# Backend Dockerfile
FROM node:20-alpine AS base

# Install dependencies
FROM base AS deps
WORKDIR /app
COPY backend/package*.json ./
RUN npm ci --only=production && npm cache clean --force

# Development
FROM base AS development
WORKDIR /app
COPY backend/package*.json ./
RUN npm ci
COPY backend/prisma ./prisma
COPY . .
EXPOSE 3001
CMD ["npm", "run", "dev"]

# Build
FROM base AS build
WORKDIR /app
COPY backend/package*.json ./
RUN npm ci --only=production && npm cache clean --force
COPY backend/prisma ./prisma
COPY backend ./
RUN npm run build

# Production
FROM node:20-alpine AS production
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY --from=build /app/dist ./dist
COPY backend/prisma ./prisma
COPY backend/.env.production ./.env
EXPOSE 3001
USER node
CMD ["node", "dist/index.js"]