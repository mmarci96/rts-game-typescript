package server

import (
	"fmt"
	"net/http"
	"net/http/httputil"
	"net/url"
	"strings"
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

func ProxyRequestHandler(
	p *httputil.ReverseProxy, t *url.URL, endpoint string) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		ct := time.Now().UTC()
		fmt.Printf("Request url:%s - %s\n", r.URL, ct)

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
		r.URL.Path = t.Path + strings.TrimPrefix(r.URL.Path, endpoint)
		fmt.Println("Connecting to:", t.String())
		p.ServeHTTP(w, r)
	}
}
