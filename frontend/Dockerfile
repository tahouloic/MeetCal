# Stage 1: Build stage
FROM node:20-alpine AS build

WORKDIR /app

# Copy package files and install dependencies (cached layer)
COPY package*.json ./
RUN npm ci

# Copy source code and build with production optimizations
COPY . .
RUN npm run build -- --configuration production

# Stage 2: Runtime stage with Nginx
FROM nginx:alpine

# Install wget for health checks
RUN apk add --no-cache wget

# Remove default Nginx configuration
RUN rm /etc/nginx/conf.d/default.conf

# Copy custom Nginx configuration
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copy built Angular app from build stage
COPY --from=build /app/dist/nedcsss/browser /usr/share/nginx/html

# Expose ports
EXPOSE 80 443

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=30s --retries=3 \
  CMD wget --quiet --tries=1 --spider http://localhost:80 || exit 1

# Start Nginx
CMD ["nginx", "-g", "daemon off;"]
