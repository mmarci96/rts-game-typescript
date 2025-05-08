package kubernetes

import (
	"context"
	"fmt"
	"log"
	"os"
	"path/filepath"

	discoveryv1 "k8s.io/api/discovery/v1"
	metav1 "k8s.io/apimachinery/pkg/apis/meta/v1"
	"k8s.io/client-go/kubernetes"
	"k8s.io/client-go/rest"
	"k8s.io/client-go/tools/clientcmd"
)

func WatchEndpointSlices() {
	fmt.Println("hiii?")
	config, err := rest.InClusterConfig()
	if err != nil {
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

	fmt.Println("before looping")
	for event := range watch.ResultChan() {
		fmt.Println("looping?")
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
				fmt.Println("Backend pod IP:", address)
			}
		}
	}
}
