package server

import (
	"fmt"
	"net/http"
	"net/http/httputil"
	"net/url"
	"strings"
	"time"
)

type ProxyRequest struct {
	Proxy    httputil.ReverseProxy
	URL      url.URL
	endpoint string
}

func NewProxy(target *url.URL) *httputil.ReverseProxy {
	proxy := httputil.NewSingleHostReverseProxy(target)
	return proxy
}

func ProxyRequestHandler(
	proxy *httputil.ReverseProxy, url *url.URL, endpoint string) func(
	http.ResponseWriter, *http.Request) {
	return func(w http.ResponseWriter, r *http.Request) {
		ct := time.Now().UTC()
		fmt.Printf("Request received at %s at %s\n", r.URL, ct)

		r.URL.Host = url.Host
		r.URL.Scheme = url.Scheme
		r.Header.Set("X-Forwarded-Host", r.Header.Get("Host"))
		r.Host = url.Host

		path := r.URL.Path
		r.URL.Path = strings.TrimLeft(path, endpoint)
		fmt.Printf("Redirecting request to %s at %s\n", r.URL, time.Now().UTC())

		proxy.ServeHTTP(w, r)
	}
}
