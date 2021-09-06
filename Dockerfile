# syntax=docker/dockerfile:1

FROM node:12.18.1

WORKDIR /app

COPY ["package.json", "./"]

RUN npm install --production

COPY . .

CMD [ "node", "./src/index.js" ]
