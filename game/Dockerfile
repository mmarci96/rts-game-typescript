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

RUN pnpm deploy --filter=game-api --prod /prod/game-api
RUN pnpm deploy --filter=game-server --prod /prod/game-server

RUN mkdir -p /prod/nginx
RUN cp -r apps/game-ui/dist /prod/nginx/game-ui
RUN cp -r apps/game-client/dist /prod/nginx/game-client

WORKDIR /prod/game-api
RUN pnpm install --prod

WORKDIR /prod/game-server
RUN pnpm install --prod

# API Service
FROM base AS game-api
COPY --from=build /prod/game-api /prod/game-api
WORKDIR /prod/game-api
EXPOSE 5000
CMD [ "pnpm", "start" ]

# Server Service
FROM base AS game-server
COPY --from=build /prod/game-server /prod/game-server
WORKDIR /prod/game-server
EXPOSE 8080 
CMD [ "pnpm", "start" ]

# Nginx for serving frontend
FROM nginx:latest AS game-frontend

COPY --from=build /prod/nginx/game-ui /usr/share/nginx/html

COPY --from=build /prod/nginx/game-client /usr/share/nginx/html2

COPY nginx.conf /etc/nginx/nginx.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]

