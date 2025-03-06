import Redis, { ChainableCommander } from "ioredis";
import { IBuilding, IPlayer, IResource, IUnit } from "@packages/game-db";
import {
    BuildingData,
    ResourceData,
    UnitData,
    GameState,
    Unit,
    Building,
    Resource,
    Player,
} from "@packages/game-data";

const redis = new Redis();

export const deletePlayerCache = async (playerId: string, gameId: string) => {
    const key = gameKey(gameId, "player", playerId);
    await redis.del(key);
};

export const getPlayerCache = async (gameId: string, playerId: string) => {
    const key = gameKey(gameId, "player", playerId);
    const playerData = await redis.hgetall(key);
    if (!playerData || Object.keys(playerData).length === 0) return null;

    return {
        ...playerData,
        playerResources: playerData.playerResources
            ? JSON.parse(playerData.playerResources)
            : null,
    };
};

export const cachePlayer = async (player: IPlayer, ttl: number = 3600) => {
    const key = gameKey(
        player.gameId.toString(),
        "player",
        player._id.toString(),
    );
    await redis.hmset(key, {
        id: player._id.toString(),
        color: player.color,
        gameId: player.gameId.toString(),
        playerResources: JSON.stringify(player.playerResources),
        name: player.name,
    });
    if (ttl > 0) await redis.expire(key, ttl);
};

export const cachePlayerResources = async (
    gameId: string,
    player: Player,
    ttl: number = 3600,
) => {
    const key = gameKey(gameId, "player", player.getId());
    await redis.hmset(key, {
        playerResources: JSON.stringify(player.getResources()),
        updatedAt: new Date().toISOString(),
    });
    if (ttl > 0) {
        await redis.expire(key, ttl);
    }
};

export const updateUnitsCache = async (gameId: string, units: Unit[]) => {
    const pipeline = redis.pipeline();
    const activeUnitIds = new Set(units.map((unit) => unit.getId()));
    const pattern = gameKey(gameId, "unit", "*");
    const existingKeys = await scanKeys(pattern);

    for (const unit of units) {
        const unitId = unit.getId();
        const key = gameKey(gameId, "unit", unitId);
        const target = {
            id: unit.attacker.getTargetId(),
            x: unit.movable.getTarget().targetX,
            y: unit.movable.getTarget().targetY,
        };
        pipeline.hmset(key, {
            position: JSON.stringify(unit.getPosition()),
            health: unit.attackable.getHealth().toString(),
            unitType: unit.getType(),
            state: unit.getStatus(),
            target: JSON.stringify(target),
            id: unit.getId(),
            color: unit.getColor(),
            speed: unit.movable.getSpeed(),
            damage: unit.attacker.getAttackDamage(),
            attackSpeed: unit.attacker.getAttackSpeed(),
            size: JSON.stringify(unit.getSize()),
            gameId,
            updatedAt: new Date().toISOString(),
        });
    }
    for (const key of existingKeys) {
        const parts = key.split(":");
        const unitIdFromKey = parts[parts.length - 1];
        if (!activeUnitIds.has(unitIdFromKey)) {
            pipeline.del(key);
            console.log("Deleting stale unit key:", key);
        }
    }
    await pipeline.exec();
};

export const updateBuildingsCache = async (
    gameId: string,
    buildings: Building[],
) => {
    const pipeline = redis.pipeline();

    for (const building of buildings) {
        const buildingId = building.getId();
        const key = gameKey(gameId, "building", buildingId);

        pipeline.hmset(key, {
            health: building.attackable.getHealth().toString(),
            state: building.getStatus(),
            updatedAt: new Date().toISOString(),
        });
    }

    await pipeline.exec();
};

export const updateResourceFieldsCache = async (
    gameId: string,
    resources: Resource[],
) => {
    const pipeline = redis.pipeline();

    for (const resource of resources) {
        const resourceId = resource.getId();
        const key = gameKey(gameId, "resource", resourceId);

        pipeline.hmset(key, {
            availableResource: resource.getAvailableResource().toString(),
        });
    }

    await pipeline.exec();
};

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

export const getGameState = async (gameId: string): Promise<GameState> => {
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

    if (!results) return [];

    return results
        .filter(([err]) => !err)
        .map(([_, data]) => parseEntity<T>(data as Record<string, string>))
        .filter((entity): entity is T => entity !== null);
};

const parseEntity = <T>(data: Record<string, string>): T | null => {
    if (!data || Object.keys(data).length === 0) return null;

    const parsed: any = {};
    for (const [key, value] of Object.entries(data)) {
        try {
            parsed[key] = ["position", "target", "size"].includes(key)
                ? JSON.parse(value)
                : ["health", "speed", "damage", "availableResource"].includes(
                        key,
                    )
                  ? Number(value || 0)
                  : value;
        } catch (e) {
            console.error(`Error parsing ${key}:`, e);
            parsed[key] = value;
        }
    }
    return parsed as T;
};

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

export const cacheUnit = async (
    unit: IUnit,
    pipeline?: ChainableCommander,
    ttl: number = 3600,
) => {
    if (!unit._id) {
        return;
    }
    const key = gameKey(unit.gameId.toString(), "unit", unit._id.toString());
    const executor = pipeline || redis;

    await executor.hmset(key, {
        id: unit._id.toString(),
        position: JSON.stringify(unit.position),
        color: unit.color,
        health: unit.health,
        speed: unit.speed,
        damage: unit.damage,
        attackSpeed: unit.attackSpeed,
        unitType: unit.unitType,
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
        buildingType: building.buildingType,
        state: building.state,
        size: JSON.stringify(building.size),
        gameId: building.gameId.toString(),
        createdAt: building.createdAt.toISOString(),
        updatedAt: building.updatedAt?.toISOString() || "",
    });

    if (ttl > 0) await executor.expire(key, ttl);
};

export const getUnitCache = async <T>(
    gameId: string,
    unitId: string,
): Promise<T | null> => {
    const key = gameKey(gameId, "unit", unitId);
    const unit = await redis.hgetall(key);

    return parseEntity<T>(unit);
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
        resourceType: resource.resourceType,
        availableResource: resource.availableResource,
        size: JSON.stringify(resource.size),
        gameId: resource.gameId.toString(),
        createdAt: resource.createdAt.toISOString(),
        updatedAt: resource.updatedAt?.toISOString() || "",
    });

    if (ttl > 0) await executor.expire(key, ttl);
};

export const deleteCachedEntity = async (
    gameId: string,
    entityType: "unit" | "building" | "resource",
    entityId: string,
) => {
    const key = gameKey(gameId, entityType, entityId);
    await redis.del(key);
};

export const flushGameCache = async (gameId: string) => {
    const keys = await scanKeys(gameKey(gameId, "*"));
    if (keys.length > 0) {
        await redis.del(...keys);
    }
};

export const flushCache = async () => {
    await redis.flushall();
};

export default redis;
