package watcher

import (
	"context"
	"fmt"
	"log"
	"net/http"
	"os"
	"path/filepath"
	"strconv"
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

type ServiceData struct {
	Id  string
	Url string
}

type ServiceTracker struct {
	mu          sync.RWMutex
	endpoints   []ServiceData
	healthPath  string
	servicePort int
}

var (
	services = map[string]*ServiceTracker{
		"game-server": {
			healthPath:  "/ping",
			servicePort: 8080,
		},
		"game-api": {
			healthPath:  "/ping",
			servicePort: 5000,
		},
	}
)

func UpdateServiceEndpoints(serviceName string, newEndpoints []ServiceData) {
	if tracker, exists := services[serviceName]; exists {
		tracker.mu.Lock()
		defer tracker.mu.Unlock()
		tracker.endpoints = newEndpoints
	}
}

func GetServiceEndpoints(serviceName string) []ServiceData {
	if tracker, exists := services[serviceName]; exists {
		tracker.mu.RLock()
		defer tracker.mu.RUnlock()
		return tracker.endpoints
	}
	return nil
}

func WatchEndpointSlices(serviceName, namespace, labelSelector string) {
	tracker, exists := services[serviceName]
	if !exists {
		log.Fatalf("[FATAL] Service %s not configured", serviceName)
	}

	fmt.Printf("[DEBUG] Loading Kubernetes config for %s...\n", serviceName)
	config, err := rest.InClusterConfig()
	if err != nil {
		fmt.Println("[DEBUG] No in-cluster config, trying local kubeconfig...")
		config, err = clientcmd.BuildConfigFromFlags("", filepath.Join(os.Getenv("HOME"), ".kube", "config"))
		if err != nil {
			log.Fatalf("[FATAL] Failed to load kubeconfig: %v", err)
		}
	}

	clientset, err := kubernetes.NewForConfig(config)
	if err != nil {
		log.Fatalf("[FATAL] Failed to create Kubernetes client: %v", err)
	}

	// Initial list
	list, err := clientset.DiscoveryV1().EndpointSlices(namespace).List(context.TODO(), metav1.ListOptions{
		LabelSelector: labelSelector,
	})
	if err != nil {
		log.Fatalf("[FATAL] Failed to list EndpointSlices: %v", err)
	}

	var initialEndpoints []ServiceData
	for _, es := range list.Items {
		eps := processEndpointSlice(&es, tracker.healthPath, tracker.servicePort)
		initialEndpoints = append(initialEndpoints, eps...)
	}
	UpdateServiceEndpoints(serviceName, initialEndpoints)

	// Start watch
	watchInterface, err := clientset.DiscoveryV1().EndpointSlices(namespace).Watch(context.TODO(), metav1.ListOptions{
		LabelSelector: labelSelector,
	})
	if err != nil {
		log.Fatalf("[FATAL] Failed to start watch: %v", err)
	}

	for range watchInterface.ResultChan() {
		list, err := clientset.DiscoveryV1().EndpointSlices(namespace).List(context.TODO(), metav1.ListOptions{
			LabelSelector: labelSelector,
		})
		if err != nil {
			log.Printf("[ERROR] Failed to re-list EndpointSlices: %v", err)
			continue
		}

		var currentEndpoints []ServiceData
		for _, es := range list.Items {
			eps := processEndpointSlice(&es, tracker.healthPath, tracker.servicePort)
			currentEndpoints = append(currentEndpoints, eps...)
		}
		UpdateServiceEndpoints(serviceName, currentEndpoints)
	}
}

func processEndpointSlice(es *discoveryv1.EndpointSlice, healthPath string, port int) []ServiceData {
	fmt.Printf("[DEBUG] Processing EndpointSlice: %s\n", es.Name)
	var endpoints []ServiceData

	for _, endpoint := range es.Endpoints {
		for _, address := range endpoint.Addresses {
			urlStr := fmt.Sprintf("http://%s:%d%s", address, port, healthPath)
			client := &http.Client{Timeout: 2 * time.Second}

			id := endpoint.TargetRef.Name
			resp, err := client.Get(urlStr)
			if err != nil {
				fmt.Printf("[ERROR] Health check failed for %s | %s: %v\n", id, urlStr, err)
				continue
			}

			if resp != nil {
				if cerr := resp.Body.Close(); cerr != nil {
					fmt.Printf("[WARNING] Failed to close response body: %v\n", cerr)
				}
			}
			if resp.StatusCode == http.StatusOK {
				fmt.Printf("[INFO] Successfully pinged backend at %s\n", urlStr)
				endpointUrl := address + ":" + strconv.Itoa(port)
				data := ServiceData{Id: id, Url: endpointUrl}
				endpoints = append(endpoints, data)
			} else {
				fmt.Printf("[WARNING] Backend at %s responded with status: %d\n", urlStr, resp.StatusCode)
			}

		}
	}
	return endpoints
}
