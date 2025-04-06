package main

import (
	"github.com/mmarci96/rts-game-monorepo/rp-server-go/internal/server"
	"log"
)

func main() {
	err := server.Run()
	if err != nil {
		log.Fatal("Go server crashing...")
	}
	select {}
}
