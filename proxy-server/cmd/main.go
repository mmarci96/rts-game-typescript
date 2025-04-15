package main

import (
	"fmt"
	"github.com/mmarci96/rts-game-monorepo/proxy-server/internal/server"
	"github.com/mmarci96/rts-game-monorepo/proxy-server/internal/store"
	"log"
)

func main() {
	store.InitializeStore()
	e := store.CleanupBackendKeys()
	if e != nil {
		fmt.Printf("Not deleted: %s", e)
	}
	err := server.Run()
	if err != nil {
		log.Fatal("Failed to start proxy server")
	}
	// select {}
}
