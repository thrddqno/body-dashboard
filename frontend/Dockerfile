# =========================
# Build stage
# =========================
FROM node:22-alpine AS build

WORKDIR /app

# Install dependencies first for better Docker caching
COPY package.json package-lock.json ./

RUN npm ci

# Copy source files
COPY . .

# TypeScript + Vite production build
RUN npm run build


# =========================
# Production stage
# =========================
FROM nginx:1.27-alpine

# Remove default nginx config
RUN rm /etc/nginx/conf.d/default.conf

# Add our SPA configuration
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copy Vite build output
COPY --from=build /app/dist /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]