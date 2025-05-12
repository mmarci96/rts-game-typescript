package main

import (
	"log"

	"github.com/mmarci96/rts-game-monorepo/proxy-server/internal/server"
	"github.com/mmarci96/rts-game-monorepo/proxy-server/internal/watcher"
)

func main() {
	go watcher.WatchEndpointSlices()

	err := server.Run()
	if err != nil {
		log.Fatal("Failed to start proxy server")
	}

	select {}
}
