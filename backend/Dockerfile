FROM node:20-alpine AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./
COPY prisma ./prisma/

# Install all dependencies
RUN npm install

# Copy source code
COPY . .

# Generate Prisma Client
RUN npx prisma generate

# Build TypeScript
RUN npm run build

# Production stage
FROM node:20-alpine

WORKDIR /app

# Install production dependencies
COPY package*.json ./
RUN npm install --omit=dev

# Copy built app and Prisma
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma
COPY --from=builder /app/prisma ./prisma

# Create directories for uploads and backups
RUN mkdir -p uploads backups

EXPOSE 5002

CMD ["node", "dist/index.js"]
