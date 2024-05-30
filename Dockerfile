FROM node:lts-alpine

RUN apk update && apk upgrade --no-cache

COPY . /app
WORKDIR /app
RUN npm install

ENTRYPOINT ["node", "index.js"]