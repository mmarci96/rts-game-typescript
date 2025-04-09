package server

import (
	"fmt"
	"log"
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
			req.URL.Path = singleJoiningSlash(target.Path, req.URL.Path)
			log.Println("Path: ", req.URL.Path)
			if target.RawQuery == "" || req.URL.RawQuery == "" {
				req.URL.RawQuery = target.RawQuery + req.URL.RawQuery
			} else {
				req.URL.RawQuery = target.RawQuery + "&" + req.URL.RawQuery
			}
			req.Host = target.Host
		},
	}
}

func ProxyRequestHandler(proxy *httputil.ReverseProxy, url *url.URL, endpoint string) func(http.ResponseWriter, *http.Request) {
	return func(w http.ResponseWriter, r *http.Request) {
		fmt.Printf("[ TinyRP ] Request received at %s at %s\n", r.URL, time.Now().UTC())
		r.URL.Host = url.Host
		r.URL.Scheme = url.Scheme
		r.Header.Set("X-Forwarded-Host", r.Header.Get("Host"))
		r.Host = url.Host

		path := r.URL.Path
		r.URL.Path = strings.TrimPrefix(path, endpoint)
		fmt.Printf("[ TinyRP ] Redirecting request to %s at %s\n", r.URL, time.Now().UTC())
		proxy.ServeHTTP(w, r)
	}
}

func singleJoiningSlash(a, b string) string {
	switch {
	case strings.HasSuffix(a, "/") && strings.HasPrefix(b, "/"):
		return a + b[1:]
	case !strings.HasSuffix(a, "/") && !strings.HasPrefix(b, "/"):
		return a + "/" + b
	}
	return a + b
}

// func ProxyRequestHandler(
// 	proxy *httputil.ReverseProxy, url *url.URL, endpoint string) func(
// 	http.ResponseWriter, *http.Request) {
// 	return func(w http.ResponseWriter, r *http.Request) {
// 		ct := time.Now().UTC()
// 		fmt.Printf("Request received at %s at %s\n", r.URL, ct)
//
// 		connection := strings.ToLower(r.Header.Get("Connection"))
// 		upgrade := strings.ToLower(r.Header.Get("Upgrade"))
// 		isWebsocket := strings.Contains(connection, "upgrade") && upgrade == "websocket"
//
// 		r.URL.Host = url.Host
// 		r.URL.Scheme = url.Scheme
// 		r.Header.Set("X-Forwarded-Host", r.Header.Get("Host"))
// 		r.Host = url.Host
// 		if isWebsocket {
// 			fmt.Println("Websocket upgrade")
// 			r.Header.Set("Connection", "upgrade")
// 			r.Header.Set("Upgrade", "websocket")
// 		}
//
// 		path := r.URL.Path
// 		r.URL.Path = strings.TrimLeft(path, endpoint)
// 		fmt.Printf("Redirecting request to %s at %s\n", r.URL, time.Now().UTC())
//
// 		proxy.ServeHTTP(w, r)
// 	}
// }
//
