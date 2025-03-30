class Camera {
    private x
    private y
    private width
    private height

    /**
     * Add width to camera as how many rows and cols it should draw map and units on
     * The camera location x, and y showing the middle of the camera location
     * @param { number } x
     * @param { number } y
     * @param { number } width
     * @param { number } height
     */
    constructor(x: number, y: number, width: number, height: number) {
        this.x = x
        this.y = y
        this.width = width
        this.height = height
    }

    getX() {
        return this.x
    }

    getY() {
        return this.y
    }

    getHeight() {
        return this.height
    }

    getWidth() {
        return this.width
    }

    moveCamera(dx: number, dy: number) {
        this.x += dx;
        this.y += dy;
    }
    setPosition(x: number, y: number) {
        this.x = x;
        this.y = y;
    }
}

export default Camera;
