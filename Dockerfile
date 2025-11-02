# Dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production || true
COPY . .
ENV PORT=8080
EXPOSE 8080
CMD ["node", "server.js"]
