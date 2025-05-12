package watcher

import (
	"context"
	"fmt"
	"log"
	"net/http"
	"os"
	"path/filepath"
	"sync"
	"time"

	discoveryv1 "k8s.io/api/discovery/v1"
	metav1 "k8s.io/apimachinery/pkg/apis/meta/v1"
	"k8s.io/apimachinery/pkg/watch"
	"k8s.io/client-go/kubernetes"
	"k8s.io/client-go/rest"
	"k8s.io/client-go/tools/clientcmd"
)

var _ watch.Interface

var (
	gameServers []string
	mu          sync.RWMutex
)

func UpdateGameServers(newServices []string) {
	mu.Lock()
	defer mu.Unlock()
	gameServers = newServices
}

func GetGameServers() []string {
	mu.RLock()
	defer mu.RUnlock()
	return gameServers
}

func WatchEndpointSlices() {
	fmt.Println("[DEBUG] Loading Kubernetes config...")
	config, err := rest.InClusterConfig()
	if err != nil {
		fmt.Println("[DEBUG] No in-cluster config, trying local kubeconfig...")
		config, err = clientcmd.BuildConfigFromFlags("", filepath.Join(os.Getenv("HOME"), ".kube", "config"))
		if err != nil {
			log.Fatalf("[FATAL] Failed to load kubeconfig: %v", err)
		}
	}
	fmt.Println("[DEBUG] Kubernetes config loaded successfully.")

	clientset, err := kubernetes.NewForConfig(config)
	if err != nil {
		log.Fatalf("[FATAL] Failed to create Kubernetes client: %v", err)
	}
	fmt.Println("[DEBUG] Kubernetes client created.")

	// First: LIST existing EndpointSlices
	fmt.Println("[DEBUG] Listing existing EndpointSlices...")
	list, err := clientset.DiscoveryV1().EndpointSlices("game-test").List(context.TODO(), metav1.ListOptions{
		LabelSelector: "app=server-test",
	})
	if err != nil {
		log.Fatalf("[FATAL] Failed to list EndpointSlices: %v", err)
	}
	var initialEndpoints []string
	for _, es := range list.Items {
		eps := processEndpointSlice(&es)
		initialEndpoints = append(initialEndpoints, eps...)
	}
	UpdateGameServers(initialEndpoints)

	fmt.Println("[DEBUG] Starting watch for EndpointSlices...")
	watchInterface, err := clientset.DiscoveryV1().EndpointSlices("game-test").Watch(context.TODO(), metav1.ListOptions{
		LabelSelector: "app=server-test",
	})
	if err != nil {
		log.Fatalf("[FATAL] Failed to start watch on EndpointSlices: %v", err)
	}

	for range watchInterface.ResultChan() {
		list, err := clientset.DiscoveryV1().EndpointSlices("game-test").List(context.TODO(), metav1.ListOptions{LabelSelector: "app=server-test"})
		if err != nil {
			log.Printf("[ERROR] Failed to re-list EndpointSlices: %v", err)
			continue
		}
		var currentGameServers []string
		for _, es := range list.Items {
			eps := processEndpointSlice(&es)
			currentGameServers = append(currentGameServers, eps...)
		}
		UpdateGameServers(currentGameServers)
	}
}

func processEndpointSlice(es *discoveryv1.EndpointSlice) []string {
	fmt.Printf("[DEBUG] Processing EndpointSlice: %s\n", es.Name)
	var endpoints []string
	if len(es.Endpoints) == 0 {
		fmt.Println("[DEBUG] EndpointSlice has no endpoints yet.")
	}

	for _, endpoint := range es.Endpoints {
		for _, address := range endpoint.Addresses {
			fmt.Printf("[DEBUG] Found endpoint address: %s\n", address)

			urlStr := fmt.Sprintf("http://%s:8080/ping", address)
			client := &http.Client{Timeout: 2 * time.Second}
			fmt.Printf("[DEBUG] Sending GET request to %s\n", urlStr)

			resp, err := client.Get(urlStr)
			if err != nil {
				fmt.Printf("[ERROR] Failed to ping %s: %v\n", urlStr, err)
				continue
			}

			if resp != nil {
				if cerr := resp.Body.Close(); cerr != nil {
					fmt.Printf("[WARNING] Failed to close response body: %v\n", cerr)
				}
			}

			if resp.StatusCode == http.StatusOK {
				fmt.Printf("[INFO] Successfully pinged backend at %s\n", urlStr)
				endpoints = append(endpoints, address)
			} else {
				fmt.Printf("[WARNING] Backend at %s responded with status: %d\n", urlStr, resp.StatusCode)
			}
		}
	}
	return endpoints
}
