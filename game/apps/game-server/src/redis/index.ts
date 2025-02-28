import Redis, { ChainableCommander } from "ioredis";
import { IBuilding, IResource, IUnit } from "@packages/game-db";
import { BuildingData, ResourceData, UnitData } from "@packages/game-data";

const redis = new Redis();

const gameKey = (gameId: string, type: string, id?: string) =>
    `game:${gameId}:${type}${id ? `:${id}` : ""}`;

export const cacheGameEntities = async (
    entities: {
        units?: IUnit[];
        buildings?: IBuilding[];
        resources?: IResource[];
    },
    ttl: number = 3600,
) => {
    const pipeline = redis.pipeline();

    entities.units?.forEach((unit) => cacheUnit(unit, pipeline, ttl));

    entities.buildings?.forEach((building) =>
        cacheBuilding(building, pipeline, ttl),
    );

    entities.resources?.forEach((resource) =>
        cacheResource(resource, pipeline, ttl),
    );

    await pipeline.exec();
};

export const getGameState = async (gameId: string) => {
    const [units, buildings, resources] = await Promise.all([
        getGameEntities<UnitData>(gameId, "unit"),
        getGameEntities<BuildingData>(gameId, "building"),
        getGameEntities<ResourceData>(gameId, "resource"),
    ]);

    return { units, buildings, resources };
};

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
    if (!results) throw new Error("no results");

    return results
        .filter(([err, data]) => !err && data)
        .map(([_, data]) => parseEntity<T>(data as Record<string, string>));
};

const parseEntity = <T>(data: Record<string, string>): T => {
    const parsed: any = {};

    for (const [key, value] of Object.entries(data)) {
        parsed[key] =
            key === "position" || key === "target" || key === "size"
                ? JSON.parse(value)
                : !isNaN(Number(value)) && value !== ""
                  ? Number(value)
                  : value;
    }

    return parsed as T;
};

const scanKeys = async (pattern: string): Promise<string[]> => {
    let cursor = "0";
    let keys: string[] = [];

    do {
        const [newCursor, newKeys] = await redis.scan(cursor, "MATCH", pattern);
        cursor = newCursor;
        keys = [...keys, ...newKeys];
    } while (cursor !== "0");

    return keys;
};

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

export const getCachedBuilding = async (
    gameId: string,
    buildingId: string,
): Promise<BuildingData | null> => {
    const key = gameKey(gameId, "building", buildingId);
    const data = await redis.hgetall(key);
    return data ? parseEntity<BuildingData>(data) : null;
};

export const getCachedResource = async (
    gameId: string,
    resourceId: string,
): Promise<ResourceData | null> => {
    const key = gameKey(gameId, "resource", resourceId);
    const data = await redis.hgetall(key);
    return data ? parseEntity<ResourceData>(data) : null;
};
export const getCachedUnit = async (
    gameId: string,
    unitId: string,
): Promise<UnitData | null> => {
    const key = gameKey(gameId, "unit", unitId);
    const data = await redis.hgetall(key);
    return data ? parseEntity<UnitData>(data) : null;
};
/**
 * Delete a unit from Redis
 * @param id - The unit's ID
 */
export const deleteCachedUnit = async (id: string) => {
    await redis.del(`unit:${id}`);
};

/**
 * Flush all units (for debugging)
 */
export const flushCache = async () => {
    await redis.flushall();
};

export default redis;
