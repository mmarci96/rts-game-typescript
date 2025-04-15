package store

import (
	"context"
	"fmt"
	"os"
	"testing"

	"github.com/stretchr/testify/assert"
)

var testStoreService = &StorageService{}
var testCtx = context.Background()

func init() {
	testStoreService = InitializeStore()
}

func TestMain(m *testing.M) {
	testStoreService = InitializeStore()

	err := flushTestRedis()
	if err != nil {
		fmt.Printf("Failed to flush Redis: %v\n", err)
		os.Exit(1)
	}

	code := m.Run()
	_ = flushTestRedis()
	os.Exit(code)
}

func flushTestRedis() error {
	if testStoreService == nil || testStoreService.redisClient == nil {
		return fmt.Errorf("redis client not initialized")
	}
	return testStoreService.redisClient.FlushDB(testCtx).Err()
}

func clearBeforeEach(t *testing.T) {
	err := testStoreService.redisClient.FlushDB(ctx).Err()
	if err != nil {
		t.Fatalf("failed to flush redis before test: %v", err)
	}
}

func TestStoreInit(t *testing.T) {
	assert.True(t, testStoreService.redisClient != nil)
}

func TestInitBackendServerAndCheckIfEmpty(t *testing.T) {
	clearBeforeEach(t)
	serverName := "server_1"
	InitBackendServer(serverName)

	conns, err := GetConnectionsForBackend(serverName)
	if err != nil {
		assert.Error(t, err, "No connections for backend found!")
	}
	assert.Empty(t, conns, "Passing")
}

func TestSaveBackendConnection(t *testing.T) {
	clearBeforeEach(t)
	serverName := "server_1"
	gameId := "60f021d61234567890000009"
	playerId := "60f021d61234567890000010"
	SaveBackendConnection(serverName, gameId, playerId)

	backend, err := GetBackendByGameID(gameId)
	if err != nil {
		assert.Error(t, err, "No backend found")
	}
	assert.Equal(t, serverName, backend)
}

func TestGettingBackendWithLeastConnections(t *testing.T) {
	clearBeforeEach(t)
	serverName := "server_1"
	emptyServer := "server_0"
	InitBackendServer(serverName)
	InitBackendServer(emptyServer)
	gameId := "60f021d61234567890000009"
	playerId := "60f021d61234567890000010"
	SaveBackendConnection(serverName, gameId, playerId)

	conn, err := GetServerWithLeastConnections()
	if err != nil {
		assert.Error(t, err, "No conns found")
	}
	assert.Equal(t, emptyServer, conn)
}

func TestCountUniqueGameIdsIfNoneAdded(t *testing.T) {
	clearBeforeEach(t)
	count, err := CountUniqueGameIDs()
	if err != nil {
		assert.Error(t, err, "No gameID-s found")
	}
	assert.Empty(t, count, "Should be zero")
}

func TestGetBackendByGameID_ReturnsErrorForMissingGameID(t *testing.T) {
	clearBeforeEach(t)
	nonExistentGameID := "game_does_not_exist"

	_, err := GetBackendByGameID(nonExistentGameID)
	assert.Error(t, err, "Should return error for non-existent game ID")
}

func TestGetServerWithLeastConnections_ReturnsErrorWhenNoneExist(t *testing.T) {
	clearBeforeEach(t)

	_, err := GetServerWithLeastConnections()
	assert.Error(t, err, "Should return error when no servers exist")
}

func TestCountUniqueGameIDs_ReturnsZeroWhenNoneAdded(t *testing.T) {
	clearBeforeEach(t)

	count, err := CountUniqueGameIDs()
	assert.NoError(t, err)
	assert.Equal(t, int64(0), count, "Expected 0 unique game IDs")
}

func TestGetConnectionsForBackend_ReturnsEmptyForUnknownServer(t *testing.T) {
	clearBeforeEach(t)

	serverName := "unknown_server"
	conns, err := GetConnectionsForBackend(serverName)
	assert.NoError(t, err)
	assert.Empty(t, conns, "Should return empty connections slice for unknown server")
}

func TestCleanupBackendKeys_RemovesAllBackendConnectionKeys(t *testing.T) {
	clearBeforeEach(t)

	server1 := "server_cleanup_1"
	server2 := "server_cleanup_2"

	InitBackendServer(server1)
	InitBackendServer(server2)

	SaveBackendConnection(server1, "game_1", "player_1")
	SaveBackendConnection(server2, "game_2", "player_2")

	key1 := fmt.Sprintf("backend:%s:connections", server1)
	key2 := fmt.Sprintf("backend:%s:connections", server2)

	exists1, err := testStoreService.redisClient.Exists(testCtx, key1).Result()
	assert.NoError(t, err)
	assert.Equal(t, int64(1), exists1, "Expected key for server1 to exist")

	exists2, err := testStoreService.redisClient.Exists(testCtx, key2).Result()
	assert.NoError(t, err)
	assert.Equal(t, int64(1), exists2, "Expected key for server2 to exist")

	err = CleanupBackendKeys()
	assert.NoError(t, err)

	exists1After, err := testStoreService.redisClient.Exists(testCtx, key1).Result()
	assert.NoError(t, err)
	assert.Equal(t, int64(0), exists1After, "Expected key for server1 to be deleted")

	exists2After, err := testStoreService.redisClient.Exists(testCtx, key2).Result()
	assert.NoError(t, err)
	assert.Equal(t, int64(0), exists2After, "Expected key for server2 to be deleted")
}

func TestRemoveBackendServer_RemovesConnectionsAndCount(t *testing.T) {
	clearBeforeEach(t)

	serverName := "server_to_remove"

	InitBackendServer(serverName)
	SaveBackendConnection(serverName, "game_x", "player_x")

	connKey := fmt.Sprintf("backend:%s:connections", serverName)
	exists, err := testStoreService.redisClient.Exists(testCtx, connKey).Result()
	assert.NoError(t, err)
	assert.Equal(t, int64(1), exists)

	score, err := testStoreService.redisClient.ZScore(testCtx, "server_connection_count", serverName).Result()
	assert.NoError(t, err)
	assert.Equal(t, float64(1), score)

	err = RemoveBackendServer(serverName)
	assert.NoError(t, err)

	existsAfter, err := testStoreService.redisClient.Exists(testCtx, connKey).Result()
	assert.NoError(t, err)
	assert.Equal(t, int64(0), existsAfter)

	r, err := testStoreService.redisClient.ZScore(testCtx, "server_connection_count", serverName).Result()
	assert.Error(t, err)
	assert.Empty(t, r, "Should be empty")
}
