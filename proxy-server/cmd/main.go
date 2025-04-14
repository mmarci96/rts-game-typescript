package main

import (
	"github.com/mmarci96/rts-game-monorepo/proxy-server/internal/server"
	"github.com/mmarci96/rts-game-monorepo/proxy-server/internal/store"
	"log"
)

func main() {
	store.InitializeStore()
	err := server.Run()
	if err != nil {
		log.Fatal("Failed to start proxy server")
	}
	select {}
}
