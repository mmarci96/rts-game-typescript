# Base image with pnpm setup
FROM node:20-slim AS base
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable

# Build stage
FROM base AS build
WORKDIR /usr/src/app

# Copy all files and install dependencies
COPY . . 

# Cache dependencies for faster builds
RUN --mount=type=cache,id=pnpm,target=/pnpm/store pnpm install --frozen-lockfile

# Ensure shared packages are built
RUN pnpm run update-packages

# Build backend apps (API & Server)
RUN pnpm --filter=game-api build
RUN pnpm --filter=game-server build

# Build frontend apps (UI & Client)
RUN pnpm --filter=game-ui build
RUN pnpm --filter=game-client build

# Deploy backend apps
RUN pnpm deploy --filter=game-api --prod /prod/game-api
RUN pnpm deploy --filter=game-server --prod /prod/game-server

# Move frontend builds to a common directory
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
WORKDIR /usr/share/nginx/html

RUN rm -rf ./*

COPY --from=build /prod/nginx/game-ui ./game-ui
COPY --from=build /prod/nginx/game-client ./game-client
COPY nginx.conf /etc/nginx/nginx.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]

