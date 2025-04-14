package server

import (
	"fmt"
	"net/http"
	"net/http/httputil"
	"net/url"
	"path/filepath"
	"strings"
)

type SpaHandler struct {
	StaticDir   string
	RoutePrefix string
}

func NewProxy(target *url.URL) *httputil.ReverseProxy {
	targetQuery := target.RawQuery
	return &httputil.ReverseProxy{
		Director: func(req *http.Request) {
			originalPath := req.URL.Path
			targetBasePath := target.Path
			req.URL.Scheme = target.Scheme
			req.URL.Host = target.Host
			req.URL.Path = singleJoiningSlash(targetBasePath, originalPath)

			if targetQuery == "" || req.URL.RawQuery == "" {
				req.URL.RawQuery = targetQuery + req.URL.RawQuery
			} else {
				req.URL.RawQuery = targetQuery + "&" + req.URL.RawQuery
			}
			req.Host = target.Host
		},
	}
}

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

func singleJoiningSlash(a, b string) string {
	aslash := strings.HasSuffix(a, "/")
	bslash := strings.HasPrefix(b, "/")
	switch {
	case aslash && bslash:
		return a + b[1:]
	case !aslash && !bslash:
		return a + "/" + b
	default:
		return a + b
	}
}
