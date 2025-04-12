package server

import (
	"encoding/json"
	"fmt"
	"net/http"
	"net/url"
	"strings"

	"github.com/mmarci96/rts-game-monorepo/proxy-server/internal/configs"
	"github.com/mmarci96/rts-game-monorepo/proxy-server/internal/store"
)

type server_endpoint struct {
	Server string `json:"server_endpoint"`
}

func Run() error {
	conf, err := configs.NewConfiguration()
	if err != nil {
		return fmt.Errorf("could not load configuration: %v\n", err)
	}
	http.Handle("/game_location/", http.HandlerFunc(getServerEndpoint))

	for _, resource := range conf.Resources {
		url, _ := url.Parse(resource.Desination_URL)
		store.InitBackendServer(resource.Name)
		proxy := NewProxy(url)
		http.HandleFunc(resource.Endpoint, proxy.ServeHTTP)
	}

	spa := SpaHandler{StaticDir: conf.Static.Dir}
	http.Handle("/ui/", spa)

	hostUrl := conf.Server.Host + ":" + conf.Server.Port
	if err := http.ListenAndServe(hostUrl, nil); err != nil {
		return fmt.Errorf("could not start the server: %v\n", err)
	}
	fmt.Printf("\nServer started: %s\n", hostUrl)
	return nil
}

func getServerEndpoint(w http.ResponseWriter, r *http.Request) {
	type serverEndpoint struct {
		Server string `json:"server_endpoint"`
	}

	path := r.URL.Path
	s := strings.Split(path, "/")
	if len(s) < 3 {
		http.Error(w, "Invalid path", http.StatusBadRequest)
		return
	}

	gameId := s[len(s)-2]
	playerId := s[len(s)-1]

	var serverName string
	var err error

	// Check if the gameId is already registered
	serverName, err = store.GetBackendByGameID(gameId)
	if err != nil || serverName == "" {
		// Not found, assign to the chillest server
		serverName, err = store.GetServerWithLeastConnections()
		if err != nil {
			http.Error(w, "No backend servers available", http.StatusServiceUnavailable)
			fmt.Printf("No chill server: %v\n", err)
			return
		}

		// Save this new connection
		store.SaveBackendConnection(serverName, gameId, playerId)
	}

	// Respond with server info
	endpoint := serverEndpoint{Server: serverName}

	fmt.Printf("GameID: %v\n", gameId)
	fmt.Printf("PlayerID: %v\n", playerId)
	fmt.Printf("Assigned Server: %v\n", serverName)
	fmt.Printf("| Get Serverendpoint requested\n| Path: %s\n", path)

	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(endpoint)
}
