# Dockerfile cho News Service
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY server.js ./
COPY routes/ ./routes/

EXPOSE 5005

CMD ["node", "server.js"]

