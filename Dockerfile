FROM node:alpine

WORKDIR /app

COPY package*.json ./

ENV TZ=Europe/Berlin

RUN ln -snf /usr/share/zoneinfo/$TZ /etc/localtime && echo $TZ > /etc/timezone && npm install

COPY . .

CMD ["node", "src/server.js"]