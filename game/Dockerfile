FROM node:20-slim AS base
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable
FROM base AS build
WORKDIR /usr/src/app
COPY . . 
RUN --mount=type=cache,id=pnpm,target=/pnpm/store pnpm install --frozen-lockfile

RUN pnpm run update-packages

RUN pnpm --filter=game-api build
RUN pnpm --filter=game-server build

RUN pnpm --filter=game-ui build
RUN pnpm --filter=game-client build

RUN pnpm deploy --filter=game-api --prod /usr/src/prod/game-api
RUN pnpm deploy --filter=game-server --prod /usr/src/prod/game-server

RUN mkdir -p /prod/nginx
RUN cp -r apps/game-ui/dist /prod/nginx/game-ui
RUN cp -r apps/game-client/dist /prod/nginx/game-client

# API Service
FROM base AS game-api
COPY --from=build /usr/src/app/prod/game-api /prod/game-api
WORKDIR /prod/game-api
EXPOSE 5000
CMD [ "pnpm", "start" ]

# Server Service
FROM base AS game-server
COPY --from=build /usr/src/app/prod/game-server /prod/game-server
WORKDIR /prod/game-server
EXPOSE 8080 
CMD [ "pnpm", "start" ]

# Frontend reverse proxy
FROM nginx:alpine AS game-frontend
COPY --from=build /prod/nginx/game-client /usr/share/nginx/html/game-client
COPY --from=build /prod/nginx/game-ui /usr/share/nginx/html/game-ui
COPY ./nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
