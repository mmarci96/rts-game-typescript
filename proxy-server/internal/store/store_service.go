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

type Player struct {
	PlayerId  string `json:"player_id"`
	SessionID string `json:"session_id"`
}

type BackendService struct {
	Endpoint         string   `json:"endpoint"`
	DestinationUrl   string   `json:"destination_url"`
	Name             string   `json:"name"`
	ConnectedPlayers []Player `json:"connected_players"`
}

func SaveProxyMapping(gameId string, serverUrl string) {
	err := storeService.redisClient.Set(
		ctx, gameId, serverUrl, CacheDuration,
	)
	if err != nil {
		fmt.Printf("Failed to save proxy mapping: %v\n", err)
	}
}

func RetrieveBackendService(name string) (BackendService, error) {
	var bs = &BackendService{}
	result, err := storeService.redisClient.Get(ctx, name).Result()
	if err != nil {
		fmt.Printf("Error getting saervice: %s, name:%s", err, name)
		return *bs, err
	}
	err = json.Unmarshal([]byte(result), bs)
	if err != nil {
		return *bs, redis.Nil
	}

	return *bs, redis.Nil
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
	for {
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
	proxyMappings := make(map[string]string)
	if len(keys) > 0 {
		values, err := storeService.redisClient.MGet(ctx, keys...).Result()
		if err != nil {
			return nil, fmt.Errorf("error fetching Redis values: %w\n", err)
		}
		for i, key := range keys {
			if values[i] != nil {
				proxyMappings[key] = values[i].(string)
			}
		}
	}

	return proxyMappings, nil
}
