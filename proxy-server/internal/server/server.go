package server

import (
	"fmt"
	"net/http"
	"net/url"
	"strings"

	"github.com/mmarci96/rts-game-monorepo/proxy-server/internal/configs"
	"github.com/mmarci96/rts-game-monorepo/proxy-server/internal/store"
	// "github.com/mmarci96/rts-game-monorepo/proxy-server/internal/store"
)

type SpaHandler struct {
	StaticDir string
}

func Run() error {
	conf, err := configs.NewConfiguration()
	if err != nil {
		return fmt.Errorf("could not load configuration: %v\n", err)
	}
	for _, resource := range conf.Resources {
		store.SaveBackendService(resource.Name, resource.Desination_URL)
	}
	http.HandleFunc("/ws/", func(w http.ResponseWriter, r *http.Request) {
		path := r.URL.Path
		gameId := strings.Split(path, "/")[2]
		backendURL := store.RetrieveServerUrl(gameId)
		fmt.Printf("+---------------------------------------------------/\n")
		fmt.Printf("|Socket request on: %s\n ", path)
		fmt.Printf("|Requesting with game id: %s\n", gameId)
		fmt.Printf("|Found destination: %s\n ", backendURL)
		fmt.Printf("+---------------------------------------------------/\n")

		url, _ := url.Parse(backendURL)
		proxy := NewProxy(url)
		proxy.ServeHTTP(w, r)
	})

	spa := SpaHandler{StaticDir: conf.Static.Dir}
	http.Handle("/ui/", spa)

	hostUrl := conf.Server.Host + ":" + conf.Server.Port

	if err := http.ListenAndServe(hostUrl, nil); err != nil {
		return fmt.Errorf("could not start the server: %v\n", err)
	}
	fmt.Printf("\nServer started: %s\n", hostUrl)
	return nil
}

func (h SpaHandler) ServeHTTP(w http.ResponseWriter, r *http.Request) {
	fs := http.Dir(h.StaticDir)
	fileServer := http.FileServer(fs)
	path := r.URL.Path

	fmt.Printf("+---------------------------------------------------------/\n")
	f, err := fs.Open(path)
	if err != nil {
		http.ServeFile(w, r, h.StaticDir+"/index.html")
		if !strings.Contains(path, ".") {
			gameId, playerID, _ := ExtractIDsFromPath(path)
			existing := store.RetrieveServerUrl(gameId)
			if existing == "" {
				store.SaveServerUrl(gameId, "http://localhost:8080/server_0/socket.io/")
			}
			store.SavePlayerConn(playerID, gameId)
			fmt.Printf("| Path: %s\n", path)
			fmt.Printf("| Game:%s\n| PlayerID:%s\n", gameId, playerID)
			fmt.Printf("| Existing data: %s\n", existing)
		}
		fmt.Printf("+----------------------------------------------------/\n")
		return
	}
	defer f.Close()
	fmt.Printf("| Served file: %s\n", path)
	fmt.Printf("+-----------------------------------------------------/\n")

	fileServer.ServeHTTP(w, r)
}
