# Dockerfile cho API Gateway
FROM node:18-alpine

# Tạo thư mục làm việc
WORKDIR /app

# Copy package files
COPY gateway/package*.json ./

# Cài đặt dependencies
RUN npm install

# Copy source code
COPY gateway/server.js ./
COPY public ./public

# Expose port
EXPOSE 5000

# Start server
CMD ["node", "server.js"]

