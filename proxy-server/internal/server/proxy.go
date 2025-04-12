package server

import (
	"errors"
	"fmt"
	"net/http/httputil"
	"net/url"
	"regexp"
	"strings"

	"github.com/mmarci96/rts-game-monorepo/proxy-server/internal/store"
	"net/http"
	"time"
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

func ProxyRequestHandler(p *httputil.ReverseProxy, t *url.URL, e string) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		ct := time.Now().UTC()
		connection := strings.ToLower(r.Header.Get("Connection"))
		upgrade := strings.ToLower(r.Header.Get("Upgrade"))
		isWebSocket := strings.Contains(connection, "upgrade") && upgrade == "websocket"

		r.URL.Scheme = t.Scheme
		r.URL.Host = t.Host
		r.Host = t.Host
		if isWebSocket {
			r.Header.Set("Connection", "upgrade")
			r.Header.Set("Upgrade", "websocket")
		}
		r.Header.Set("X-Forwarded-Host", r.Host)
		r.Header.Set("X-Real-IP", r.RemoteAddr)
		r.URL.Path = t.Path + strings.TrimPrefix(r.URL.Path, e)

		fmt.Printf("+-----------------------------------------------------+\n")
		fmt.Printf("| Request url:%s - %s\n", r.URL, ct)
		fmt.Printf("| Connecting to: %s\n", t.String())
		fmt.Printf("+-----------------------------------------------------+\n")
		p.ServeHTTP(w, r)
	}
}

func RegisterConnection(gameID string, playerID string) error {
	serverName := store.RetrieveServerUrl(gameID)
	if serverName == "" {
		fmt.Printf("No proxy alias found in store for game: %s\n", gameID)
	}
	fmt.Printf("Server found for [ Game: %s]\n [ Server: %s ]\n", gameID, serverName)
	return nil
}

var objectIDRegex = regexp.MustCompile(`^[a-fA-F0-9]{24}$`)

func ExtractIDsFromPath(path string) (gameID string, playerID string, err error) {
	parts := strings.Split(path, "/")
	// Expecting something like: ["", "ui", "gameId", "playerId"]
	if len(parts) != 4 || parts[1] != "ui" {
		return "", "", errors.New("invalid path format\n")
	}
	gameID = parts[2]
	playerID = parts[3]
	if !objectIDRegex.MatchString(gameID) {
		return "", "", errors.New("invalid game ID format")
	}
	if !objectIDRegex.MatchString(playerID) {
		return "", "", errors.New("invalid player ID format")
	}
	return gameID, playerID, nil
}
