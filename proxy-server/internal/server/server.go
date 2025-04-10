package server

import (
	"fmt"
	"net/http"
	"strings"

	"github.com/mmarci96/rts-game-monorepo/proxy-server/internal/configs"
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
	spa := SpaHandler{StaticDir: conf.Static.Dir}
	// http.Handle("/ws/", )
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
	p := strings.Split(r.URL.Path, "/")
	root := "/" + strings.Join(p[2:], "/")

	fmt.Printf("\n------------------------------------------------------\n")
	fmt.Printf("Path: %s\n", path)
	fmt.Printf("Root: %s\n", root)
	f, err := fs.Open(path)
	if err != nil {
		if !strings.Contains(path, ".") {
			fmt.Printf("Error and dot: %s\n", err)
			http.ServeFile(w, r, h.StaticDir+"/index.html")
		} else {
			fmt.Printf("Not served shit on this request\n")
			http.NotFound(w, r)
		}
		return
	}
	defer f.Close()
	stat, _ := f.Stat()
	if stat.IsDir() {
		fmt.Printf("Standard way served")
		http.ServeFile(w, r, h.StaticDir+"/index.html")
		return
	}
	fmt.Printf("Did not return %v\n", stat)
	fmt.Printf("\n------------------------------------------------------\n")

	fileServer.ServeHTTP(w, r)
}

// urlParts := strings.Split(path, "/")
// origin := urlParts[1]
// if origin == "ui" {
// 	id := urlParts[2]
// 	fmt.Printf("GameID: %s\n", urlParts[2])
// 	fmt.Printf("PlayerID: %s\n", urlParts[3])
// 	store.SaveProxyMapping(id)
// }
// vibeCheck, err := store.GetAllProxyMappings()
// if err != nil {
// 	fmt.Println("No data from vibeCheck")
// }
// fmt.Printf("\n[ Vibe ] results: %+v\n", vibeCheck)
