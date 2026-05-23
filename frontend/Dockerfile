# ── Stage 1: Build React app ──────────────────────────
FROM node:18-alpine AS build
WORKDIR /app
 
# Copy package files first for better Docker layer caching
COPY package*.json ./
RUN npm install --legacy-peer-deps
 
# Copy source and build
COPY . .
RUN npm run build
 
# ── Stage 2: Serve with Nginx ─────────────────────────
FROM nginx:1.25-alpine
WORKDIR /usr/share/nginx/html
 
# Remove default nginx page
RUN rm -rf ./*
 
# Copy built React files from stage 1
COPY --from=build /app/build .
 
# Copy custom nginx config
COPY nginx.conf /etc/nginx/conf.d/default.conf
 
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
 


