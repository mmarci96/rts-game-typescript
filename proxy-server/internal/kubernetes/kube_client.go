package kubernetes

import (
	"context"
	"fmt"
	"log"
	"net/http"
	"os"
	"path/filepath"
	"time"

	discoveryv1 "k8s.io/api/discovery/v1"
	metav1 "k8s.io/apimachinery/pkg/apis/meta/v1"
	"k8s.io/client-go/kubernetes"
	"k8s.io/client-go/rest"
	"k8s.io/client-go/tools/clientcmd"
)

func WatchEndpointSlices() {
	config, err := rest.InClusterConfig()
	if err != nil {
		fmt.Println("No clusterconfig. Attemting to load from kube config...")
		config, err = clientcmd.BuildConfigFromFlags("", filepath.Join(os.Getenv("HOME"), ".kube", "config"))
		if err != nil {
			log.Fatalf("Failed to build kube config: %v", err)
		}
	}

	clientset, err := kubernetes.NewForConfig(config)
	if err != nil {
		log.Fatalf("Failed to build kube config: %v", err)
	}

	watch, err := clientset.DiscoveryV1().EndpointSlices("test-proxy").Watch(context.TODO(), metav1.ListOptions{
		LabelSelector: "app=game-server",
	})
	if err != nil {
		log.Fatalf("Failed to build kube config: %v", err)
	}

	for event := range watch.ResultChan() {
		es, ok := event.Object.(*discoveryv1.EndpointSlice)

		if len(es.Endpoints) == 0 {
			fmt.Println("No endpoints found yet")
		}
		if !ok {
			fmt.Println("Unexpected type")
			continue
		}

		for _, endpoint := range es.Endpoints {
			for _, address := range endpoint.Addresses {
				url := fmt.Sprintf("http://%s:8080/ping", address)

				client := &http.Client{
					Timeout: 2 * time.Second,
				}

				resp, err := client.Get(url)
				if err != nil {
					fmt.Printf("Failed to ping %s: %v\n", url, err)
					continue
				}

				if resp != nil {
					if cerr := resp.Body.Close(); cerr != nil {
						fmt.Printf("Warning: failed to close response body: %v\n", cerr)
					}
				}

				if resp.StatusCode == http.StatusOK {
					fmt.Printf("Successfully pinged backend at %s\n", url)
				} else {
					fmt.Printf("Backend at %s responded with status: %d\n", url, resp.StatusCode)
				}
				fmt.Println("Backend pod IP:", address)
			}
		}
	}
}
