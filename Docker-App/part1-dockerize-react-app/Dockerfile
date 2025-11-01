# ---------- STAGE 1: Build ----------
FROM node:20-alpine AS build

WORKDIR /app

# Copy package.json files
COPY package*.json ./

# Install dependencies
RUN npm ci --silent

# Copy all app files
COPY . .

# Build production-ready files
RUN npm run build

# ---------- STAGE 2: Serve with Nginx ----------
FROM nginx:stable-alpine AS production

# Clean default nginx content
RUN rm -rf /usr/share/nginx/html/*

# Copy build output from build stage
COPY --from=build /app/build /usr/share/nginx/html

# Copy custom nginx config
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
