// package store
//
// import (
// 	"github.com/stretchr/testify/assert"
// 	"testing"
// )
//
// var testStoreService = &StorageService{}
//
// func init() {
// 	testStoreService = InitializeStore()
// }
//
// func TestStoreInit(t *testing.T) {
// 	assert.True(t, testStoreService.redisClient != nil)
// }
//
// func TestInsertionAndRetrieval(t *testing.T) {
// 	gameId := "60f021d61234567890000009"
// 	serverURL := "http://localhost:8080/server_0/socket.io/"
//
// 	// Persist data mapping
// 	SaveServerUrl(gameId, serverURL)
//
// 	// Retrieve initial URL
// 	retrievedUrl := RetrieveServerUrl(gameId)
//
// 	assert.Equal(t, serverURL, retrievedUrl)
// }
//
// func TestInsertBackendService(t *testing.T) {
// 	name := "server_1"
// 	destinationURL := "http://localhost:8081/server_1/socket.io/"
//
// 	backendService := BackendService{Name: name, DestinationUrl: destinationURL, ConnectedPlayers: nil}
// 	SaveBackendService(name, destinationURL)
//
// 	retrievedBackendService, err := RetrieveBackendService(name)
// 	if err != nil {
// 		assert.Error(t, err, "Error retrieving backendservice by name")
// 	}
// 	assert.Equal(t, backendService, retrievedBackendService)
//
// }
