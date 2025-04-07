package server

import (
	"net/http"

	"github.com/gorilla/websocket"
)

func ProxySocketHandler(proxy *websocket.Conn, p *http.Client)
