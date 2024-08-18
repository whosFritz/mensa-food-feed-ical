# Für beide Architekturen
FROM node:16-alpine AS builder

WORKDIR /app

COPY package*.json ./

ENV TZ=Europe/Berlin

RUN ln -snf /usr/share/zoneinfo/$TZ /etc/localtime && \
    echo $TZ > /etc/timezone && \
    npm install

COPY . .

# Für amd64
FROM node:16-alpine AS amd64
WORKDIR /app
COPY --from=builder /app .
CMD ["node", "src/server.js"]

# Für arm64
FROM arm64v8/node:16-alpine AS arm64
WORKDIR /app
COPY --from=builder /app .
CMD ["node", "src/server.js"]