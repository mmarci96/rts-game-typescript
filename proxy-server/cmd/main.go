package main

import (
	"log"

	"github.com/mmarci96/rts-game-monorepo/proxy-server/internal/kubernetes"
	"github.com/mmarci96/rts-game-monorepo/proxy-server/internal/server"
)

func main() {
	go kubernetes.WatchEndpointSlices()

	err := server.Run()
	if err != nil {
		log.Fatal("Failed to start proxy server")
	}

	select {}
}
