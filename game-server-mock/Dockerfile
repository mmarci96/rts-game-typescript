FROM node:23-alpine

WORKDIR /app

COPY package*.json ./

RUN npm ci --omit=dev 

COPY ./src ./src

USER node

COPY --chown=node:node . .

ENTRYPOINT ["node", "/app/src/index.js"]
