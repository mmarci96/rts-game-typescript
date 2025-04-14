package store

import (
	"context"
	"fmt"
	"time"

	"github.com/redis/go-redis/v9"
)

type StorageService struct {
	redisClient *redis.Client
}

type connection struct {
	GameId   string `json:"game_id"`
	PlayerId string `json:"player_id"`
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
	fmt.Printf("Redis started successfully: pong message = {%s}\n", pong)
	storeService.redisClient = redisClient
	return storeService
}

func InitBackendServer(serverName string) {
	connKey := fmt.Sprintf("backend:%s:connections", serverName)
	_ = storeService.redisClient.Del(ctx, connKey) // optional cleanup

	err := storeService.redisClient.ZAddNX(ctx, "server_connection_count", redis.Z{
		Score:  0,
		Member: serverName,
	}).Err()
	if err != nil {
		fmt.Printf("Error initializing server in connection count set: %v\n", err)
	}
}
func SaveBackendConnection(serverName, gameId, playerId string) {
	connKey := fmt.Sprintf("backend:%s:connections", serverName)
	gameKey := fmt.Sprintf("game_to_backend:%s", gameId)
	conn := fmt.Sprintf("%s:%s", gameId, playerId)

	added, err := storeService.redisClient.SAdd(ctx, connKey, conn).Result()
	if err != nil {
		fmt.Printf("Error saving connection to server set: %v\n", err)
		return
	}

	if added > 0 {
		err = storeService.redisClient.Set(ctx, gameKey, serverName, CacheDuration).Err()
		if err != nil {
			fmt.Printf("Error saving game-to-server mapping: %v\n", err)
		}

		err = storeService.redisClient.SAdd(ctx, "game_ids", gameId).Err()
		if err != nil {
			fmt.Printf("Error adding game ID to global set: %v\n", err)
		}

		err = storeService.redisClient.ZIncrBy(ctx, "server_connection_count", 1, serverName).Err()
		if err != nil {
			fmt.Printf("Error incrementing server connection count: %v\n", err)
		}
	}
}

func GetServerWithLeastConnections() (string, error) {
	servers, err := storeService.redisClient.ZRange(ctx, "server_connection_count", 0, 0).Result()
	if err != nil {
		return "", fmt.Errorf("failed to get servers by connection count: %v", err)
	}
	if len(servers) == 0 {
		return "", fmt.Errorf("no servers available")
	}
	return servers[0], nil
}

func GetBackendByGameID(gameId string) (string, error) {
	key := fmt.Sprintf("game_to_backend:%s", gameId)
	serverName, err := storeService.redisClient.Get(ctx, key).Result()
	if err != nil {
		return "", fmt.Errorf("could not find server for gameId %s: %v", gameId, err)
	}
	return serverName, nil
}

func CountUniqueGameIDs() (int64, error) {
	count, err := storeService.redisClient.SCard(ctx, "game_ids").Result()
	if err != nil {
		return 0, fmt.Errorf("error getting unique game count: %v", err)
	}
	return count, nil
}

func GetConnectionsForBackend(serverName string) ([]connection, error) {
	key := fmt.Sprintf("backend:%s:connections", serverName)
	members, err := storeService.redisClient.SMembers(ctx, key).Result()
	if err != nil {
		return nil, err
	}

	var connections []connection
	for _, m := range members {
		var c connection
		_, err := fmt.Sscanf(m, "%s:%s", &c.GameId, &c.PlayerId)
		if err != nil {
			continue
		}
		connections = append(connections, c)
	}
	return connections, nil
}
