package main

import (
	"github.com/mmarci96/rts-game-monorepo/proxy-server/internal/server"
	"log"
)

func main() {
	err := server.Run()
	if err != nil {
		log.Fatal("Failed to start proxy server")
	}
	select {}
}
