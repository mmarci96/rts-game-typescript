import Redis from "ioredis";
import { IBuilding, IResource, IUnit } from "@packages/game-db";
import { BuildingData, ResourceData, UnitData } from "@packages/game-data";

const redis = new Redis();

/**
 * Save a unit to Redis
 * @param unit - The unit object to cache
 */
export const cacheUnit = async (unit: IUnit) => {
    const key = `unit:${unit._id.toString()}`;

    await redis.hmset(key, {
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

    await redis.expire(key, 3600); // Cache expires after 1 hour (optional)
};

export const cacheBuilding = async (building: IBuilding) => {
    const key = `building:${building._id.toString()}`;
    await redis.hmset(key, {
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
    await redis.expire(key, 3600);
};

export const getCachedBuilding = async (
    id: string,
): Promise<BuildingData | null> => {
    const key = `building:${id}`;
    const data = await redis.hgetall(key);
    if (!data || Object.keys(data).length === 0) return null;
    return {
        id: id,
        position: JSON.parse(data.position),
        color: data.color as any,
        health: parseInt(data.health),
        type: data.type as any,
        state: data.state,
        size: JSON.parse(data.size),
        gameId: data.gameId,
    };
};

export const cacheResources = async (resource: IResource) => {
    const key = `resource:${resource._id.toString()}`;
    await redis.hmset(key, {
        id: resource._id.toString(),
        position: JSON.stringify(resource.position),
        type: resource.type,
        availableResource: resource.availableResource,
        size: JSON.stringify(resource.size),
        gameId: resource.gameId.toString(),
        createdAt: resource.createdAt.toISOString(),
        updatedAt: resource.updatedAt?.toISOString() || "",
    });

    await redis.expire(key, 3600);
};

export const getCachedResource = async (
    id: string,
): Promise<ResourceData | null> => {
    const key = `resource:${id}`;
    const data = await redis.hgetall(key);

    if (!data || Object.keys(data).length === 0) return null;

    return {
        id: id,
        position: JSON.parse(data.position),
        type: data.type as string,
        availableResource: parseInt(data.availableResource),
        size: JSON.parse(data.size),
        gameId: data.gameId,
    };
};

/**
 * Get a unit from Redis
 * @param id - The unit's ID
 * @returns The unit object or null if not found
 */
export const getCachedUnit = async (id: string): Promise<UnitData | null> => {
    const key = `unit:${id}`;
    const data = await redis.hgetall(key);

    if (!data || Object.keys(data).length === 0) return null;

    return {
        id: id,
        position: JSON.parse(data.position),
        color: data.color as any,
        health: parseInt(data.health),
        speed: parseInt(data.speed),
        damage: parseInt(data.damage),
        type: data.type as any,
        state: data.state,
        target: JSON.parse(data.target),
        size: JSON.parse(data.size),
        gameId: data.gameId,
    };
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
