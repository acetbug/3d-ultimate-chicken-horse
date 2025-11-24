export class Loop {
    private callback: () => void;
    private running: boolean = false;

    constructor(callback: () => void) {
        this.callback = callback;
    }

    public start(): void {
        if (this.running) return;
        this.running = true;
        this.animate();
    }

    public stop(): void {
        this.running = false;
    }

    private animate = (): void => {
        if (!this.running) return;
        requestAnimationFrame(this.animate);
        this.callback();
    }
}
