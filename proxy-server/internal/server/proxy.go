package server

import (
	"fmt"
	"net/http/httputil"
	"net/url"

	"github.com/mmarci96/rts-game-monorepo/proxy-server/internal/store"
	"net/http"
)

func NewProxy(target *url.URL) *httputil.ReverseProxy {
	return &httputil.ReverseProxy{
		Director: func(req *http.Request) {
			req.URL.Scheme = target.Scheme
			req.URL.Host = target.Host
			req.URL.Path = target.Path
			req.Host = target.Host
		},
	}
}

type SpaHandler struct {
	StaticDir string
}

func (h SpaHandler) ServeHTTP(w http.ResponseWriter, r *http.Request) {
	fs := http.Dir(h.StaticDir)
	fileServer := http.FileServer(fs)
	path := r.URL.Path
	f, err := fs.Open(path)
	if err != nil {
		http.ServeFile(w, r, h.StaticDir+"/index.html")
		return
	}
	defer f.Close()
	fileServer.ServeHTTP(w, r)
}

func RegisterConnection(gameID, playerID string) error {
	serverName, err := store.GetBackendByGameID(gameID)
	if err != nil {
		fmt.Printf("No proxy alias found in store for game: %s\n", gameID)
		store.SaveBackendConnection(serverName, gameID, playerID)
	}
	fmt.Printf("Server found for [ Game: %s]\n [ Server: %s ]\n", gameID, serverName)
	return nil
}
