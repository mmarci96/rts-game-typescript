FROM node:20-slim AS base
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable

FROM base AS build
COPY . /usr/src/app
WORKDIR /usr/src/app
RUN --mount=type=cache,id=pnpm,target=/pnpm/store pnpm install --frozen-lockfile
RUN pnpm run build

RUN pnpm deploy --filter=game-api --prod /prod/game-api
RUN pnpm deploy --filter=game-server --prod /prod/game-server

FROM base AS game-api 
COPY --from=build /prod/game-api /prod/game-api
WORKDIR /prod/game-api
EXPOSE 5000
CMD [ "pnpm", "start" ]

FROM base AS game-server
COPY --from=build /prod/game-server /prod/
WORKDIR /prod/game-server
EXPOSE 8080
CMD [ "pnpm", "start" ]
