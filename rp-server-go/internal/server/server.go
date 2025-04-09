package server

import (
	"fmt"
	"github.com/mmarci96/rts-game-monorepo/rp-server-go/internal/configs"
	"log"
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

	// Check if the requested path exists as a file
	path := r.URL.Path
	f, err := fs.Open(path)
	if err != nil {
		// If the file doesn't exist and it's not a directory, fallback to index.html
		if !strings.Contains(path, ".") { // Don't treat URLs with file extensions as fallback
			log.Printf("Servingurlwithext : %s", path)
			http.ServeFile(w, r, h.staticDir+"/index.html")
		} else {
			// If it's a real file path, 404 or similar
			log.Printf("Should go 404 %s", path)
			http.NotFound(w, r)
		}
		return
	}
	defer f.Close()

	// If the file is a directory, fallback to index.html
	stat, _ := f.Stat()
	if stat.IsDir() {
		http.ServeFile(w, r, h.staticDir+"/index.html")
		return
	}

	// Serve the actual file for valid paths
	fileServer.ServeHTTP(w, r)
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
