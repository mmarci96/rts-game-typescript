package store

import (
	"context"
	"fmt"
	"time"

	"encoding/json"
	"github.com/redis/go-redis/v9"
)

type StorageService struct {
	redisClient *redis.Client
}

var (
	storeService = &StorageService{}
	ctx          = context.Background()
)

const CacheDuration = 6 * time.Hour

func InitializeStore() *StorageService {
	redisClient := redis.NewClient(&redis.Options{
		Addr:     "localhost:6379",
		Password: "",
		DB:       0,
	})

	pong, err := redisClient.Ping(ctx).Result()
	if err != nil {
		panic(fmt.Sprintf("Error init Redis: %v", err))
	}

	fmt.Printf("\nRedis started successfully: pong message = {%s}\n", pong)
	storeService.redisClient = redisClient
	return storeService
}

type ProxyAlias struct {
	GameID    string
	ServerURL string
}

type ServerEndpoint struct {
	Endpoint       string
	DestinationUrl string
}

type Player struct {
	id        string
	sessionID string
}

type BackendService struct {
	Endpoint       string
	DestinationUrl string
	Name           string
}

func SaveBackendService(name string, endpoint string, destination string) {
	s := BackendService{Name: name, Endpoint: endpoint, DestinationUrl: destination}
	bytes, _ := json.Marshal(s)
	err := storeService.redisClient.Set(ctx, name, bytes, CacheDuration).Err()
	if err != nil {
		fmt.Printf("Error saving: %s", err)
		return
	}
}

func RetrieveServer(gameId string) string {
	res, err := storeService.redisClient.Get(ctx, gameId).Result()
	if err != nil {
		fmt.Printf("Failed getting server | Error: %v - shortUrl: %s\n", err, gameId)
	}
	return res
}

func GetAllProxyMappings() (map[string]string, error) {
	keys := []string{}
	cursor := uint64(0)

	// We are assuming you have `storeService.redisClient` available
	for {
		// SCAN command to get keys in batches
		result, newCursor, err := storeService.redisClient.Scan(ctx, cursor, "*", 0).Result()
		if err != nil {
			return nil, fmt.Errorf("error scanning Redis: %w", err)
		}

		keys = append(keys, result...)
		cursor = newCursor

		if cursor == 0 {
			break
		}
	}

	// Now use MGET to retrieve all values for the keys
	proxyMappings := make(map[string]string)
	if len(keys) > 0 {
		values, err := storeService.redisClient.MGet(ctx, keys...).Result()
		if err != nil {
			return nil, fmt.Errorf("error fetching Redis values: %w\n", err)
		}

		// Store values in map
		for i, key := range keys {
			if values[i] != nil {
				proxyMappings[key] = values[i].(string)
			}
		}
	}

	return proxyMappings, nil
}

func SaveProxyMapping(gameId string, serverName string) {
	server_0 := "server_0"

	err := storeService.redisClient.Set(
		ctx, gameId, server_0, CacheDuration,
	)
	if err != nil {
		fmt.Printf("Failed to save proxy mapping: %v\n", err)
	}
}

// func RetrieveInitialUrl(shortUrl string) string {
// 	result, err := storeService.redisClient.Get(ctx, shortUrl).Result()
// 	if err != nil {
// 		panic(fmt.Sprintf("Failed RetrieveInitialUrl url | Error: %v - shortUrl: %s\n", err, shortUrl))
// 	}
// 	return result
// }
//
// func SaveUrlMapping(shortUrl string, originalUrl string, userId string) {
// 	err := storeService.redisClient.Set(ctx, shortUrl, originalUrl, CacheDuration).Err()
// 	if err != nil {
// 		panic(fmt.Sprintf("Failed saving key url | Error: %v - shortUrl: %s - originalUrl: %s\n", err, shortUrl, originalUrl))
// 	}
//
// }
