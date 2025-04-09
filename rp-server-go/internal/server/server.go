package server

import (
	"fmt"
	"net/http"
	"net/url"

	"os"

	"github.com/mmarci96/rts-game-monorepo/rp-server-go/internal/configs"
)

type spaHandler struct {
	staticDir string
}

func (h spaHandler) ServeHTTP(w http.ResponseWriter, r *http.Request) {
	fs := http.Dir(h.staticDir)
	path := r.URL.Path
	if _, err := fs.Open(path); os.IsNotExist(err) {
		r.URL.Path = "/"
	}

	http.FileServer(fs).ServeHTTP(w, r)
}

func Run() error {
	config, err := configs.NewConfiguration()
	if err != nil {
		return fmt.Errorf("could not load configuration: %v", err)
	}
	mux := http.NewServeMux()
	for _, resource := range config.Connections {
		url, _ := url.Parse(resource.Desination_URL)
		proxy := NewProxy(url)
		mux.HandleFunc(resource.Endpoint, ProxyRequestHandler(proxy, url, resource.Endpoint))
	}
	fmt.Printf("[ ProxyServer ] Server running on http://%s:%s\n", config.Server.Host, config.Server.Port)

	spa := spaHandler{staticDir: config.Static.Dir}
	mux.Handle("/", spa)

	if err := http.ListenAndServe(config.Server.Host+":"+config.Server.Port, mux); err != nil {
		return fmt.Errorf("could not start the server: %v", err)
	}
	return nil
}
