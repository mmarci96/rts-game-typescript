package server

import (
	"encoding/json"
	"fmt"
	"net/http"
	"net/url"

	"github.com/mmarci96/rts-game-monorepo/proxy-server/internal/configs"
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
	var serverEndpoint = server_endpoint{Server: "server_0"}
	url := r.URL.String()
	path := r.URL.Path
	fmt.Printf("| Get Serverendpoint requested\n| Path:%s\n| Url%s\n", url, path)
	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(serverEndpoint)
}
