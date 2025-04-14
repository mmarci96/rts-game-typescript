FROM node:18-alpine AS client

WORKDIR /usr/app

COPY ./socket-io-client-mock/package*.json .

RUN npm install

COPY ./socket-io-client-mock/ .

RUN npm run build

FROM golang:1.24.2-alpine

WORKDIR /app

RUN apk add --no-cache git

COPY ./rp-server-go/go.mod ./rp-server-go/go.sum ./

RUN go mod download

COPY ./rp-server-go/ .

COPY --from=client /usr/app/dist /app/internal/html/dist

RUN CGO_ENABLED=0 GOOS=linux GOARCH=amd64 go build -o main ./cmd/main.go

EXPOSE 80

ENTRYPOINT ["/app/main"]
