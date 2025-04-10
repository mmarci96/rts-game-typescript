package server

import (
	"fmt"
	"net/http/httputil"
	"net/url"
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
