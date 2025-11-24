export class InputManager {
    public keys: { [key: string]: boolean } = {};
    public mouseDelta: { x: number, y: number } = { x: 0, y: 0 };

    constructor() {
        window.addEventListener('keydown', (e) => {
            this.keys[e.code] = true;
        });

        window.addEventListener('keyup', (e) => {
            this.keys[e.code] = false;
        });

        window.addEventListener('mousemove', (e) => {
            this.mouseDelta.x = e.movementX || 0;
            this.mouseDelta.y = e.movementY || 0;
        });
    }

    public getAxis(negative: string, positive: string): number {
        return (this.keys[positive] ? 1 : 0) - (this.keys[negative] ? 1 : 0);
    }

    public isKeyPressed(key: string): boolean {
        return !!this.keys[key];
    }

    public getMouseDelta() {
        const delta = { ...this.mouseDelta };
        // Reset delta after reading to prevent drift when mouse stops
        this.mouseDelta = { x: 0, y: 0 };
        return delta;
    }
}
