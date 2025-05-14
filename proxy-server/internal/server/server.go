package server

import (
	"fmt"
	"log"
	"net/http"
	"net/http/httputil"
	"net/url"
	"path/filepath"
	"strings"
	"time"

	"github.com/mmarci96/rts-game-monorepo/proxy-server/internal/configs"
	"github.com/mmarci96/rts-game-monorepo/proxy-server/internal/store"
	"github.com/mmarci96/rts-game-monorepo/proxy-server/internal/watcher"
)

var proxyClient = &http.Client{
	Timeout: time.Second,
	Transport: &http.Transport{
		MaxIdleConnsPerHost: 100,
		IdleConnTimeout:     90 * time.Second,
	},
}

type SpaHandler struct {
	StaticDir   string
	RoutePrefix string
}

func Run() error {
	conf, err := configs.NewConfiguration()
	if err != nil {
		return fmt.Errorf("could not load configuration: %v", err)
	}
	redisAddr := conf.Redis.Host + ":" + conf.Redis.Port
	store.InitializeStore(redisAddr)
	// e := store.CleanupBackendKeys()
	// if e != nil {
	// 	fmt.Printf("Not deleted: %s", e)
	// }
	initServiceStore()

	gameApp := SpaHandler{StaticDir: conf.Static.Game, RoutePrefix: "/game"}
	homeApp := SpaHandler{StaticDir: conf.Static.Home}

	http.HandleFunc("/socket.io/", gameServerProxyHandler)
	http.HandleFunc("/api/", apiServerProxyHandler)
	http.Handle("/game/", gameApp)
	http.Handle("/", homeApp)

	hostUrl := conf.Server.Host + ":" + conf.Server.Port
	fmt.Println("Server started: " + hostUrl)
	if err := http.ListenAndServe(hostUrl, nil); err != nil {
		return fmt.Errorf("could not start the server: %v ", err)
	}
	return nil
}

func initServiceStore() {
	gameServers := watcher.GetServiceEndpoints("game-server")
	for _, serverEndpoints := range gameServers {
		fmt.Println("[DEBUG] InitServerStorage for server endpoint: ", serverEndpoints)
		store.InitBackendServer(serverEndpoints)
	}
}

func apiServerProxyHandler(w http.ResponseWriter, r *http.Request) {
	apiServers := watcher.GetServiceEndpoints("game-api")
	backend := apiServers[0]
	apiServerProxyRequest(backend, w, r)
}

func gameServerProxyHandler(w http.ResponseWriter, r *http.Request) {
	gameId := r.URL.Query().Get("gameId")
	playerId := r.URL.Query().Get("playerId")
	backends := watcher.GetServiceEndpoints("game-server")
	if len(backends) == 0 {
		http.Error(w, "No backends available", http.StatusServiceUnavailable)
		return
	}
	existing, err := store.GetBackendByGameID(gameId)
	if err != nil {
		fmt.Println("[WARNING] No existing backend: ", err)
		store.SaveBackendConnection(backends[0], gameId, playerId)
	}

	fmt.Println("[DEBUG] Existing backend by gameid: ", existing)
	// Implement your load balancing logic here using 'backends'
	// Example: Round Robin, Random selection, etc.
	fmt.Println("[INFO] Backend on handler", backends,
		"Gameid on request", gameId,
		"Playerid on request", playerId)
	backend := backends[0]
	gameServerProxyRequest(backend, w, r)
}

/*Creates a proxy client with the backendurl from the parameters for the
* game-server sockets, connection socketio clients to server. Removing the
* queries after the right server endpoiint was founf. Added extra header
* X-Forwarded-For but preserving rest of the Scheme
 */
func gameServerProxyRequest(backend string, w http.ResponseWriter, r *http.Request) {
	store.InitBackendServer(backend)
	target := &url.URL{
		Scheme: "http",
		Host:   backend,
	}

	proxy := httputil.NewSingleHostReverseProxy(target)
	proxy.Transport = proxyClient.Transport

	originalDirector := proxy.Director
	proxy.Director = func(req *http.Request) {
		originalDirector(req)

		query := req.URL.Query()
		query.Del("gameId")
		query.Del("playerId")
		req.URL.RawQuery = query.Encode()

		req.URL.Scheme = target.Scheme
		req.URL.Host = target.Host
		req.Host = target.Host
		req.Header.Set("X-Forwarded-For", r.RemoteAddr)
	}

	proxy.ErrorHandler = func(w http.ResponseWriter, r *http.Request, err error) {
		log.Printf("[ERROR] Proxy error: %v", err)
		w.WriteHeader(http.StatusBadGateway)
	}

	proxy.ServeHTTP(w, r)
}

/* Almost indentical to the gameServerProxyRequest function. does not strip url from it*/
func apiServerProxyRequest(backend string, w http.ResponseWriter, r *http.Request) {
	store.InitBackendServer(backend)
	target := &url.URL{
		Scheme: "http",
		Host:   backend,
	}

	proxy := httputil.NewSingleHostReverseProxy(target)
	proxy.Transport = proxyClient.Transport

	originalDirector := proxy.Director
	proxy.Director = func(req *http.Request) {
		originalDirector(req)

		req.URL.Scheme = target.Scheme
		req.URL.Host = target.Host
		req.Host = target.Host
		req.Header.Set("X-Forwarded-For", r.RemoteAddr)
	}

	proxy.ErrorHandler = func(w http.ResponseWriter, r *http.Request, err error) {
		log.Printf("[ERROR] Proxy error: %v", err)
		w.WriteHeader(http.StatusBadGateway)
	}

	proxy.ServeHTTP(w, r)
}

/*Serves static files, can handle single page app with react-routing*/
func (h SpaHandler) ServeHTTP(w http.ResponseWriter, r *http.Request) {
	path := strings.TrimPrefix(r.URL.Path, h.RoutePrefix)
	fs := http.Dir(h.StaticDir)
	fileServer := http.FileServer(fs)

	f, err := fs.Open(path)
	if err != nil {
		http.ServeFile(w, r, filepath.Join(h.StaticDir, "index.html"))
		return
	}
	defer func() {
		if cerr := f.Close(); cerr != nil {
			fmt.Printf("Error closing file: %v\n", cerr)
		}
	}()

	stat, err := f.Stat()
	if err != nil || stat.IsDir() {
		http.ServeFile(w, r, filepath.Join(h.StaticDir, "index.html"))
		return
	}

	r.URL.Path = path
	fileServer.ServeHTTP(w, r)
}
