FROM golang:1.24.2-alpine AS builder

WORKDIR /app

COPY ./go-reverse-proxy/go.mod ./go-reverse-proxy/go.sum ./

RUN go mod download

RUN CGO_ENABLED=0 GOOS=linux GOARCH=amd64 go build -o main ./cmd/main.go

EXPOSE 80

ENTRYPOINT ["/app/main"]
