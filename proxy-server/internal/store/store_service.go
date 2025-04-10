package store

import (
	"context"
	"fmt"
	"github.com/redis/go-redis/v9"
	"time"
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

	fmt.Printf("\nRedis started successfully: pong message = {%s}", pong)
	storeService.redisClient = redisClient
	return storeService
}

type GameID struct {
	id string
}

type ServerEndpoint struct {
	Endpoint       string
	DestinationUrl string
}

type Player struct {
	id        string
	sessionID string
}

type GameConnections struct {
	ConnectionMap map[GameID]ServerEndpoint
}

func RetrieveProxyMapping(gameId string) string {
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
			return nil, fmt.Errorf("error fetching Redis values: %w", err)
		}

		// Store values in map
		for i, key := range keys {
			if values[i] != nil {
				proxyMappings[key] = values[i].(string)
				// gameId := GameID{key}
				// server := ServerEndpoint{Endpoint: "/socket.io", DestinationUrl: values[i].(string)}
				// conn.ConnectionMap[gameId] = server
			}
		}
	}

	return proxyMappings, nil
}

func SaveProxyMapping(gameId string) {
	server_0 := "http://loaclhost:8080/server_0/socket.io/"

	err := storeService.redisClient.Set(
		ctx, gameId, server_0, CacheDuration,
	)
	if err != nil {
		fmt.Printf("Failed to save proxy mapping Error: %v - GameID:%s",
			err, gameId)
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
