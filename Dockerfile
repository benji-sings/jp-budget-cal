# Node.js/Express Frontend and Gateway
# Multi-stage build for optimized production image
# CIS Docker Benchmark v1.7.0 Level 2 Compliant

# Stage 1: Build
FROM node:20-alpine AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install all dependencies (including devDependencies for build)
RUN npm ci

# Copy source code
COPY client ./client
COPY server ./server
COPY shared ./shared
COPY script ./script
COPY attached_assets ./attached_assets
COPY tsconfig.json vite.config.ts tailwind.config.ts postcss.config.js drizzle.config.ts ./

# Build the frontend and server
RUN npm run build

# Stage 2: Production
FROM node:20-alpine AS production

# CIS 4.1 - Add image metadata labels
LABEL maintainer="Japan Travel Budget Calculator Team" \
      version="1.0" \
      description="Japan Travel Budget Calculator - Express Gateway" \
      org.opencontainers.image.source="https://github.com/example/japan-travel-calculator" \
      org.opencontainers.image.vendor="Japan Travel Team" \
      org.opencontainers.image.licenses="MIT" \
      security.level="CIS-L2"

WORKDIR /app

# Install only production dependencies
COPY package*.json ./
RUN npm ci --only=production && \
    # CIS 4.6 - Remove package manager cache
    npm cache clean --force && \
    rm -rf /tmp/*

# Copy complete dist folder from builder stage
COPY --from=builder /app/dist ./dist

# CIS 4.1 - Create non-root user for security
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodejs -u 1001 -G nodejs && \
    # Create necessary directories with proper permissions
    mkdir -p /app/tmp && \
    chown -R nodejs:nodejs /app

# CIS 5.25 - Set restrictive file permissions
RUN chmod -R 550 /app/dist && \
    chmod -R 770 /app/tmp

# CIS 4.1 - Run as non-root user
USER nodejs

# Expose port (non-privileged port as per CIS 5.7)
EXPOSE 5000

# CIS 5.26 - Health check for container monitoring
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
    CMD wget --no-verbose --tries=1 --spider http://localhost:5000/api/health || exit 1

# CIS 4.7 - Use exec form for CMD to ensure proper signal handling
CMD ["node", "dist/index.cjs"]
