# Stage 1: Build
FROM node:20-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm install --legacy-peer-deps
COPY . .
ARG VITE_API_BASE_URL=/api
ARG VITE_WS_DELIVERY_URL=/ws/tracking
ARG VITE_OSRM_URL=https://router.project-osrm.org/route/v1/driving
ARG VITE_GOOGLE_CLIENT_ID=
ARG VITE_GITHUB_CLIENT_ID=
ARG VITE_RAZORPAY_KEY_ID=
ARG VITE_LOCATIONIQ_API_KEY=
ARG VITE_OAUTH_REDIRECT_BASE_URL=
ARG NODE_OPTIONS=--max-old-space-size=4096
ENV VITE_API_BASE_URL=$VITE_API_BASE_URL
ENV VITE_WS_DELIVERY_URL=$VITE_WS_DELIVERY_URL
ENV VITE_OSRM_URL=$VITE_OSRM_URL
ENV VITE_GOOGLE_CLIENT_ID=$VITE_GOOGLE_CLIENT_ID
ENV VITE_GITHUB_CLIENT_ID=$VITE_GITHUB_CLIENT_ID
ENV VITE_RAZORPAY_KEY_ID=$VITE_RAZORPAY_KEY_ID
ENV VITE_LOCATIONIQ_API_KEY=$VITE_LOCATIONIQ_API_KEY
ENV VITE_OAUTH_REDIRECT_BASE_URL=$VITE_OAUTH_REDIRECT_BASE_URL
ENV NODE_OPTIONS=$NODE_OPTIONS
RUN npm run build

# Stage 2: Serve
FROM nginx:alpine
COPY --from=build /app/dist /usr/share/nginx/html
# Add custom nginx config if needed for SPA routing
RUN echo 'server { \
    listen 80; \
    location / { \
        root /usr/share/nginx/html; \
        index index.html index.htm; \
        try_files $uri $uri/ /index.html; \
    } \
    location /api/ { \
        proxy_pass http://gateway:8000/api/; \
        proxy_set_header Host $host; \
        proxy_set_header X-Forwarded-Host $host; \
        proxy_set_header X-Real-IP $remote_addr; \
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for; \
        proxy_set_header X-Forwarded-Proto $scheme; \
    } \
    location /ws/ { \
        proxy_pass http://gateway:8000/ws/; \
        proxy_http_version 1.1; \
        proxy_set_header Upgrade $http_upgrade; \
        proxy_set_header Connection "Upgrade"; \
        proxy_set_header Host $host; \
    } \
}' > /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
