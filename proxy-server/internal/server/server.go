package server

import (
	"encoding/json"
	"fmt"
	"net/http"
	// "net/url"
	"strings"

	"github.com/mmarci96/rts-game-monorepo/proxy-server/internal/configs"
	"github.com/mmarci96/rts-game-monorepo/proxy-server/internal/store"
)

func Run() error {
	conf, err := configs.NewConfiguration()
	if err != nil {
		return fmt.Errorf("could not load configuration: %v", err)
	}
	redisAddr := conf.Redis.Host + ":" + conf.Redis.Port
	store.InitializeStore(redisAddr)
	e := store.CleanupBackendKeys()
	if e != nil {
		fmt.Printf("Not deleted: %s", e)
	}

	http.Handle("/game_location/", http.HandlerFunc(getServerEndpoint))

	// for _, resource := range conf.Resources {
	// 	_, err := http.Get(resource.Desination_URL + "ping")
	// 	if err != nil {
	// 		fmt.Printf("Backend service check err, skipping: %s \n", resource.Name)
	// 		e := store.RemoveBackendServer(resource.Name)
	// 		if e != nil {
	// 			return fmt.Errorf("backend remove failed:: %v ", e)
	// 		}
	// 		continue
	// 	}
	// 	url, _ := url.Parse(resource.Desination_URL)
	// 	isSocketIO := strings.Contains(resource.Endpoint, "socket.io")
	// 	if isSocketIO {
	// 		fmt.Printf("Initiating backend service: %s", resource.Name)
	// 		store.InitBackendServer(resource.Name)
	// 	}
	// 	proxy := NewProxy(url)
	// 	http.HandleFunc(resource.Endpoint, proxy.ServeHTTP)
	// }

	gameApp := SpaHandler{StaticDir: conf.Static.Game, RoutePrefix: "/game"}
	homeApp := SpaHandler{StaticDir: conf.Static.Home}
	http.Handle("/game/", gameApp)
	http.Handle("/", homeApp)

	hostUrl := conf.Server.Host + ":" + conf.Server.Port
	fmt.Printf("\nServer started: %s\n", hostUrl)
	if err := http.ListenAndServe(hostUrl, nil); err != nil {
		return fmt.Errorf("could not start the server: %v ", err)
	}
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

	serverName, err = store.GetBackendByGameID(gameId)
	if err != nil || serverName == "" {
		serverName, err = store.GetServerWithLeastConnections()
		if err != nil {
			http.Error(w, "No backend servers available", http.StatusServiceUnavailable)
			fmt.Printf("No chill server: %v\n", err)
			return
		}

		store.SaveBackendConnection(serverName, gameId, playerId)
	}
	endpoint := serverEndpoint{Server: serverName}
	w.WriteHeader(http.StatusOK)
	err = json.NewEncoder(w).Encode(endpoint)
	if err != nil {
		http.Error(w, "Failed to encode response", http.StatusInternalServerError)
		fmt.Printf("Error encoding JSON response: %v\n", err)
		return
	}
}
