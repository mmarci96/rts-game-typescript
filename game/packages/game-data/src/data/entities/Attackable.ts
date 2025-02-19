class Attackable {
    #health;

    /**
    * @param health number
    */
    constructor(health: number) {
        this.#health = health;
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

}

export default Attackable;
