# Dockerfile cho Order Service
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY server.js ./
COPY routes/ ./routes/

EXPOSE 5004

CMD ["node", "server.js"]


