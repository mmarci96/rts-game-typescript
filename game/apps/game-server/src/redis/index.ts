import Redis, { ChainableCommander } from "ioredis";
import { IBuilding, IResource, IUnit } from "@packages/game-db";
import { BuildingData, ResourceData, UnitData } from "@packages/game-data";
import { GameState } from "../types";

const redis = new Redis();

/**
 * Generate consistent Redis key for game entities
 * @param gameId - Parent game identifier
 * @param type - Entity type (unit/building/resource)
 * @param id - Optional specific entity ID
 * @returns Redis key string
 */
const gameKey = (gameId: string, type: string, id?: string) =>
    `game:${gameId}:${type}${id ? `:${id}` : ""}`;

/**
 * Cache multiple game entities in a single Redis pipeline
 * @param entities - Object containing arrays of entities to cache
 * @param ttl - Time-to-live in seconds (default 1 hour)
 */
export const cacheGameEntities = async (
    entities: {
        units?: IUnit[];
        buildings?: IBuilding[];
        resources?: IResource[];
    },
    ttl: number = 3600,
) => {
    const pipeline = redis.pipeline();

    // Queue all entities in the pipeline
    entities.units?.forEach((unit) => cacheUnit(unit, pipeline, ttl));
    entities.buildings?.forEach((building) =>
        cacheBuilding(building, pipeline, ttl),
    );
    entities.resources?.forEach((resource) =>
        cacheResource(resource, pipeline, ttl),
    );

    await pipeline.exec();
};

/**
 * Retrieve complete game state from Redis
 * @param gameId - Target game identifier
 * @returns Object containing all game entities
 */
export const getGameState = async (gameId: string): Promise<GameState> => {
    const [units, buildings, resources] = await Promise.all([
        getGameEntities<UnitData>(gameId, "unit"),
        getGameEntities<BuildingData>(gameId, "building"),
        getGameEntities<ResourceData>(gameId, "resource"),
    ]);

    return { units, buildings, resources };
};

/**
 * Generic entity loader for a specific game
 * @param gameId - Target game identifier
 * @param entityType - Type of entities to load
 * @returns Array of parsed entities
 */
const getGameEntities = async <T>(
    gameId: string,
    entityType: string,
): Promise<T[]> => {
    const pattern = gameKey(gameId, entityType, "*");
    const keys = await scanKeys(pattern);

    if (keys.length === 0) return [];

    const pipeline = redis.pipeline();
    keys.forEach((key) => pipeline.hgetall(key));
    const results = await pipeline.exec();

    if (!results) return [];

    return results
        .filter(([err]) => !err)
        .map(([_, data]) => parseEntity<T>(data as Record<string, string>))
        .filter((entity): entity is T => entity !== null); // Type guard
};

/**
 * Parse Redis hash data into typed entity
 * Handles JSON parsing and type conversions
 */
const parseEntity = <T>(data: Record<string, string>): T | null => {
    if (!data || Object.keys(data).length === 0) return null;

    const parsed: any = {};
    for (const [key, value] of Object.entries(data)) {
        try {
            parsed[key] =
                // Parse JSON fields
                ["position", "target", "size"].includes(key)
                    ? JSON.parse(value)
                    : // Convert numeric fields (handle empty strings as 0)
                      [
                            "health",
                            "speed",
                            "damage",
                            "availableResource",
                        ].includes(key)
                      ? Number(value || 0)
                      : // Preserve other values
                        value;
        } catch (e) {
            console.error(`Error parsing ${key}:`, e);
            parsed[key] = value;
        }
    }
    return parsed as T;
};

/**
 * Safe Redis key scanner using SCAN
 * @param pattern - Key pattern to match
 * @returns Array of matching keys
 */
const scanKeys = async (pattern: string): Promise<string[]> => {
    let cursor = "0";
    let keys: string[] = [];

    do {
        try {
            const [newCursor, newKeys] = await redis.scan(
                cursor,
                "MATCH",
                pattern,
            );
            cursor = newCursor;
            keys = [...keys, ...newKeys];
        } catch (e) {
            console.error("SCAN error:", e);
            break;
        }
    } while (cursor !== "0");

    return keys;
};

// Individual entity caching functions -------------------------------------------------

/**
 * Cache a single game unit
 * @param unit - Unit to cache
 * @param pipeline - Optional pipeline for bulk operations
 * @param ttl - Time-to-live in seconds
 */
export const cacheUnit = async (
    unit: IUnit,
    pipeline?: ChainableCommander,
    ttl: number = 3600,
) => {
    const key = gameKey(unit.gameId.toString(), "unit", unit._id.toString());
    const executor = pipeline || redis;

    await executor.hmset(key, {
        id: unit._id.toString(),
        position: JSON.stringify(unit.position),
        color: unit.color,
        health: unit.health,
        speed: unit.speed,
        damage: unit.damage,
        type: unit.type,
        state: unit.state,
        target: JSON.stringify(unit.target),
        size: JSON.stringify(unit.size),
        gameId: unit.gameId.toString(),
        createdAt: unit.createdAt.toISOString(),
        updatedAt: unit.updatedAt?.toISOString() || "",
    });

    if (ttl > 0) await executor.expire(key, ttl);
};

/**
 * Cache a single building
 * @param building - Building to cache
 * @param pipeline - Optional pipeline for bulk operations
 * @param ttl - Time-to-live in seconds
 */
export const cacheBuilding = async (
    building: IBuilding,
    pipeline?: ChainableCommander,
    ttl: number = 3600,
) => {
    const key = gameKey(
        building.gameId.toString(),
        "building",
        building._id.toString(),
    );
    const executor = pipeline || redis;

    await executor.hmset(key, {
        id: building._id.toString(),
        position: JSON.stringify(building.position),
        color: building.color,
        health: building.health,
        type: building.type,
        state: building.state,
        size: JSON.stringify(building.size),
        gameId: building.gameId.toString(),
        createdAt: building.createdAt.toISOString(),
        updatedAt: building.updatedAt?.toISOString() || "",
    });

    if (ttl > 0) await executor.expire(key, ttl);
};

/**
 * Cache a single resource node
 * @param resource - Resource to cache
 * @param pipeline - Optional pipeline for bulk operations
 * @param ttl - Time-to-live in seconds
 */
export const cacheResource = async (
    resource: IResource,
    pipeline?: ChainableCommander,
    ttl: number = 3600,
) => {
    const key = gameKey(
        resource.gameId.toString(),
        "resource",
        resource._id.toString(),
    );
    const executor = pipeline || redis;

    await executor.hmset(key, {
        id: resource._id.toString(),
        position: JSON.stringify(resource.position),
        type: resource.type,
        availableResource: resource.availableResource,
        size: JSON.stringify(resource.size),
        gameId: resource.gameId.toString(),
        createdAt: resource.createdAt.toISOString(),
        updatedAt: resource.updatedAt?.toISOString() || "",
    });

    if (ttl > 0) await executor.expire(key, ttl);
};

// Individual entity getters -----------------------------------------------------------

export const getCachedBuilding = async (
    gameId: string,
    buildingId: string,
): Promise<BuildingData | null> => {
    const key = gameKey(gameId, "building", buildingId);
    const data = await redis.hgetall(key);
    return parseEntity<BuildingData>(data);
};

export const getCachedResource = async (
    gameId: string,
    resourceId: string,
): Promise<ResourceData | null> => {
    const key = gameKey(gameId, "resource", resourceId);
    const data = await redis.hgetall(key);
    return parseEntity<ResourceData>(data);
};

export const getCachedUnit = async (
    gameId: string,
    unitId: string,
): Promise<UnitData | null> => {
    const key = gameKey(gameId, "unit", unitId);
    const data = await redis.hgetall(key);
    return parseEntity<UnitData>(data);
};

// Cache management ---------------------------------------------------------------------

/**
 * Delete specific game entity
 * @param gameId - Parent game ID
 * @param entityType - Type of entity to delete
 * @param entityId - Target entity ID
 */
export const deleteCachedEntity = async (
    gameId: string,
    entityType: "unit" | "building" | "resource",
    entityId: string,
) => {
    const key = gameKey(gameId, entityType, entityId);
    await redis.del(key);
};

/**
 * Flush all data for a specific game
 * @param gameId - Target game ID to clear
 */
export const flushGameCache = async (gameId: string) => {
    const keys = await scanKeys(gameKey(gameId, "*"));
    if (keys.length > 0) {
        await redis.del(...keys);
    }
};

/**
 * Flush entire Redis database (debug only)
 */
export const flushCache = async () => {
    await redis.flushall();
};

export default redis;
