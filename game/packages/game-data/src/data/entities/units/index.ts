import Unit from "./Unit";
import Warrior from "./Warrior";
import Worker from "./Worker";
import Archer from "./Archer";
export const BASE_UNIT_CONFIG = {
    warrior: {
        health: 20,
        speed: 8,
        damage: 4,
        attackSpeed: 1.6,
        attackRange: 1.2,
        radius: 0.6,
        height: 0.4,
    },
    worker: {
        health: 10,
        speed: 4,
        damage: 1,
        attackSpeed: 0.2,
        attackRange: 1.0,
        radius: 0.4,
        height: 0.3,
    },
    archer: {
        health: 12,
        speed: 6,
        damage: 6,
        attackSpeed: 1,
        attackRange: 8,
        radius: 0.6,
        height: 0.4,
    },
};
export { Unit, Warrior, Worker, Archer };
