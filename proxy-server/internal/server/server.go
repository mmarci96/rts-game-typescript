package server

import (
	"fmt"
	"net/http"
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
		return fmt.Errorf("could not load configuration: %v", err)
	}
	http.HandleFunc("/ws/", func(w http.ResponseWriter, r *http.Request) {
		path := r.URL.Path
		fmt.Printf("+--------------------------------+")
		fmt.Printf("|Socket request on: %s\n", path)
		gameId := strings.Split(path, "/")[2]
		fmt.Printf("|Requesting with game id: %s\n", gameId)
		backendURL := store.RetrieveServer(gameId)
		fmt.Printf("|Found destination: %s\n", backendURL)
		fmt.Printf("+--------------------------------+")

	})
	// http.HandleFunc("/ws/67f82d5ba87ce182ff73a2fd/socket.io/", func(w http.ResponseWriter, r *http.Request) {
	// 	p := r.URL.Path
	// 	fmt.Printf("\n --- [ On test Path: %s ] ---", p)
	// })
	for _, res := range conf.Resources {
		fmt.Printf("\n[ Resource loaded ] %v\n", res)
		store.SaveBackendService(res.Name, res.Endpoint, res.Desination_URL)
		proxy, _ := NewProxy(res.Desination_URL)
		http.Handle(res.Endpoint, proxy)
	}

	spa := SpaHandler{StaticDir: conf.Static.Dir}
	http.Handle("/ui/", spa)
	endpoint := conf.Server.Host + ":" + conf.Server.Port
	fmt.Printf("\nServer started: %s\n", endpoint)
	if err := http.ListenAndServe(endpoint, nil); err != nil {
		return fmt.Errorf("could not start the server: %v", err)
	}
	return nil
}

func (h SpaHandler) ServeHTTP(w http.ResponseWriter, r *http.Request) {
	fs := http.Dir(h.StaticDir)
	fileServer := http.FileServer(fs)
	path := r.URL.Path

	fmt.Printf("+----------------------------------------------------+\n")
	fmt.Printf("| Path: %s\n", path)

	f, err := fs.Open(path)
	if err != nil {
		http.ServeFile(w, r, h.StaticDir+"/index.html")
		if !strings.Contains(path, ".") {
			gameId, playerID, _ := ExtractIDsFromPath(path)
			fmt.Printf("| Game:%s\n| PlayerID:%s\n", gameId, playerID)
			store.SaveProxyMapping(gameId, "server_0")
		}
		fmt.Printf("+----------------------------------------------------+\n")
		return
	}
	defer f.Close()
	fmt.Printf("| Served file: %s\n", path)
	fmt.Printf("+----------------------------------------------------+\n")

	fileServer.ServeHTTP(w, r)
}
