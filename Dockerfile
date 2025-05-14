FROM node:20-slim AS base
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable
FROM base AS build
WORKDIR /usr/src
COPY ./game ./
RUN --mount=type=cache,id=pnpm,target=/pnpm/store pnpm install --frozen-lockfile
RUN pnpm run update-packages

RUN pnpm --filter=game-api build && \
    pnpm --filter=game-server build && \
    pnpm --filter=game-ui build && \
    pnpm --filter=game-client build

RUN mkdir -p /prod && \
    pnpm deploy --filter=game-api --prod /prod/game-api && \
    pnpm deploy --filter=game-server --prod /prod/game-server && \
    mkdir -p /prod/go /prod/go/home /prod/go/game && \
    cp -r apps/game-ui/dist /prod/go/game/dist && \
    cp -r apps/game-client/dist /prod/go/home/dist

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

FROM golang:1.24.3 AS build-proxy
WORKDIR /build
# RUN apk add --no-cache git
COPY ./proxy-server/go.mod ./proxy-server/go.sum ./
RUN go mod download
COPY ./proxy-server/ .
COPY --from=build /prod/go/game ./internal/html/game
COPY --from=build /prod/go/home ./internal/html/home
COPY ./proxy-config.yaml ./data/config.yaml
RUN CGO_ENABLED=0 GOOS=linux GOARCH=amd64 go build -o main ./cmd/main.go

# --- final small runtime image ---
FROM alpine:3.20 AS reverse-proxy
WORKDIR /app
RUN apk add --no-cache dumb-init
COPY --from=build-proxy /build/main /app/main
COPY --from=build-proxy /build/internal/html /app/internal/html
COPY --from=build-proxy /build/data/config.yaml /app/data/config.yaml
EXPOSE 80
ENTRYPOINT ["/app/main"]

