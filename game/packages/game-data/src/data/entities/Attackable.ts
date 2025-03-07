class Attackable {
    #health;
    #maxHealth;

    /**
     * @param health number
     */
    constructor(health: number) {
        this.#health = health;
        this.#maxHealth = health;
    }
    getMaxHealth() {
        return this.#maxHealth;
    }

    /**
     * @param damage number
     */
    getAttacked(damage: number) {
        this.#health = this.#health - damage;
    }

    /**
     * @returns number
     */
    getHealth() {
        return this.#health;
    }

    setHealth(health: number) {
        this.#health = health;
    }
}

export default Attackable;
