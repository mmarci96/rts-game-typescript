package server

import (
	"fmt"
	"github.com/mmarci96/rts-game-monorepo/rp-server-go/internal/configs"
	"net/http"
	"net/url"
	"strings"
)

type spaHandler struct {
	staticDir string
}

func (h spaHandler) ServeHTTP(w http.ResponseWriter, r *http.Request) {
	fs := http.Dir(h.staticDir)
	fileServer := http.FileServer(fs)
	path := r.URL.Path
	fmt.Printf("Path of client: %s", path)
	urlParts := strings.Split(path, "/")
	fmt.Printf("GameID: %s", urlParts[:2])
	f, err := fs.Open(path)
	if err != nil {
		if !strings.Contains(path, ".") {
			http.ServeFile(w, r, h.staticDir+"/index.html")
		} else {
			http.NotFound(w, r)
		}
		return
	}
	defer f.Close()
	stat, _ := f.Stat()
	if stat.IsDir() {
		http.ServeFile(w, r, h.staticDir+"/index.html")
		return
	}
	fileServer.ServeHTTP(w, r)
}

func Run() error {
	config, err := configs.NewConfiguration()
	if err != nil {
		return fmt.Errorf("could not load configuration: %v", err)
	}
	mux := http.NewServeMux()
	for _, resource := range config.Resources {
		url, _ := url.Parse(resource.Desination_URL)
		proxy := NewProxy(url)
		mux.HandleFunc(resource.Endpoint, proxy.ServeHTTP)
	}

	spa := spaHandler{staticDir: config.Static.Dir}
	mux.Handle("/", spa)

	endpoint := config.Server.Host + ":" + config.Server.Port
	fmt.Printf("Server started: %s", endpoint)
	if err := http.ListenAndServe(endpoint, mux); err != nil {
		return fmt.Errorf("could not start the server: %v", err)
	}
	return nil
}
