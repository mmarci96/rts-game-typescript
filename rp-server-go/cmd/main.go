package main

import (
	"net/http"

	"github.com/mmarci96/rts-game-monorepo/rp-server-go/internal/server"
)

func main() {
	server.SetupRoutes()
	http.ListenAndServe(":4000", nil)
}
