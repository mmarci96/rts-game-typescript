package main

import (
	"github.com/mmarci96/rts-game-monorepo/proxy-server/internal/server"
	"github.com/mmarci96/rts-game-monorepo/proxy-server/internal/store"
	"log"
)

func main() {
	// proxy, err := NewProxy("http://localhost:8080/server_0/socket.io/")
	// if err != nil {
	// 	panic(err)
	// }
	// proxy1, err := NewProxy("http://localhost:8081/server_1/socket.io/")
	// if err != nil {
	// 	panic(err)
	// }
	// http.Handle("/server_0/socket.io/", proxy)
	// http.Handle("/server_1/socket.io/", proxy1)
	// proxy := httputil.NewSingleHostReverseProxy(origin)

	store.InitializeStore()
	err := server.Run()
	// log.Fatal(http.ListenAndServe(":8000", nil))
	if err != nil {
		log.Fatal("Failed to start proxy server")
	}
	select {}
}
