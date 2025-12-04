# Dockerfile cho Auth Service
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY server.js ./
COPY routes/ ./routes/

EXPOSE 5001

CMD ["node", "server.js"]

