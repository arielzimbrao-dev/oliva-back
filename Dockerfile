# Development stage (installs all deps including dev)
FROM node:18-alpine AS development
WORKDIR /app
COPY package*.json ./
RUN npm ci


# Build stage (uses dev deps to compile, then prunes to production)
FROM node:18-alpine AS build
WORKDIR /app
COPY package*.json ./
COPY --from=development /app/node_modules ./node_modules
COPY tsconfig*.json ./
COPY src/ ./src/
RUN npm run build
RUN npm run migration:run || true
ENV NODE_ENV=production
RUN npm ci --only=production && npm cache clean --force

# Production stage (minimal runtime image)
FROM node:18-alpine AS production
WORKDIR /app
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/dist ./dist
EXPOSE 3000
USER node
CMD ["node", "dist/main.js"]
