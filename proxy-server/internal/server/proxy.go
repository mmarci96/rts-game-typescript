package server

import (
	"errors"
	"fmt"
	"net/http/httputil"
	"net/url"
	"regexp"
	"strings"

	"github.com/mmarci96/rts-game-monorepo/proxy-server/internal/store"
)

func NewProxy(rawUrl string) (*httputil.ReverseProxy, error) {
	url, err := url.Parse(rawUrl)
	if err != nil {
		return nil, err
	}
	fmt.Printf("Proxy url: %s\n", url)
	proxy := httputil.NewSingleHostReverseProxy(url)

	return proxy, nil
}

func RegisterConnection(gameID string, playerID string) error {
	serverName := store.RetrieveServer(gameID)
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
