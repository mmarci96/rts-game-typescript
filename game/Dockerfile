FROM node:20-slim AS base
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable
FROM base AS build
WORKDIR /usr/src
COPY . .
RUN --mount=type=cache,id=pnpm,target=/pnpm/store pnpm install --frozen-lockfile
RUN pnpm run update-packages

#This should be adjusted when deploying to cloud
COPY .env.vite apps/game-ui/.env
COPY .env.vite apps/game-client/.env

RUN pnpm --filter=game-api build && \
    pnpm --filter=game-server build && \
    pnpm --filter=game-ui build && \
    pnpm --filter=game-client build

RUN mkdir -p /prod && \
    pnpm deploy --filter=game-api --prod /prod/game-api && \
    pnpm deploy --filter=game-server --prod /prod/game-server && \
    mkdir -p /prod/nginx && \
    cp -r apps/game-ui/dist /prod/nginx/game-ui && \
    cp -r apps/game-client/dist /prod/nginx/game-client

FROM node:20-alpine AS game-api
WORKDIR /app
COPY --from=build /prod/game-api .
RUN apk add --no-cache dumb-init python3 make g++ && \
    npm rebuild bcrypt --build-from-source && \
    apk del python3 make g++
CMD ["dumb-init", "node", "dist/index.js"]

FROM node:20-alpine AS game-server
WORKDIR /app
COPY --from=build /prod/game-server .
RUN apk add --no-cache dumb-init
CMD ["dumb-init", "node", "dist/index.js"]

FROM nginx:alpine AS game-frontend
COPY --from=build /prod/nginx/game-client /usr/share/nginx/html/game-client
COPY --from=build /prod/nginx/game-ui /usr/share/nginx/html/game-ui
COPY ./nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
